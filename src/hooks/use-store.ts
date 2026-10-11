// Storage for the twin, its loans and saved scenarios. Signed-out users keep everything in
// this browser (localStorage); signed-in users keep it in Firestore. When someone signs in,
// anything they entered locally is moved into their account.
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  type DocumentReference,
} from "firebase/firestore";
import { toast } from "sonner";
import { db } from "@/integrations/firebase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Loan } from "@/lib/loans";
import type { Scenario, Twin } from "@/lib/twin";

const LOCAL = {
  loans: "fintwin.loans.v1",
  scenarios: "fintwin.scenarios.v1",
  twin: "fintwin.twin.v1",
} as const;
type ListName = "loans" | "scenarios";
type Item = { id: string; createdAt: string };

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error(
      "Couldn't save in this browser. Private mode or blocked storage can cause this.",
    );
  }
}

function removeLocal(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Nothing stored, nothing to remove.
  }
}

// Firestore rejects `undefined` values.
const clean = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const byCreated = (a: Item, b: Item) => a.createdAt.localeCompare(b.createdAt);

// ---------- lists: loans and scenarios ----------

async function list<T extends Item>(name: ListName, uid?: string): Promise<T[]> {
  if (!uid) return readLocal<T[]>(LOCAL[name], []).sort(byCreated);
  const snapshot = await getDocs(collection(db, "users", uid, name));
  return snapshot.docs.map((d) => d.data() as T).sort(byCreated);
}

async function put<T extends Item>(name: ListName, uid: string | undefined, item: T) {
  if (!uid) {
    const items = readLocal<T[]>(LOCAL[name], []).filter((x) => x.id !== item.id);
    writeLocal(LOCAL[name], [...items, item]);
    return;
  }
  await setDoc(doc(db, "users", uid, name, item.id), clean(item));
}

async function remove(name: ListName, uid: string | undefined, id: string) {
  if (!uid) {
    writeLocal(
      LOCAL[name],
      readLocal<Item[]>(LOCAL[name], []).filter((x) => x.id !== id),
    );
    return;
  }
  await deleteDoc(doc(db, "users", uid, name, id));
}

// ---------- the twin profile ----------

async function readTwin(uid?: string): Promise<Twin | null> {
  if (!uid) return readLocal<Twin | null>(LOCAL.twin, null);
  const snapshot = await getDoc(doc(db, "profiles", uid));
  return (snapshot.data()?.twin as Twin | undefined) ?? null;
}

async function writeTwin(uid: string | undefined, twin: Twin) {
  if (!uid) return writeLocal(LOCAL.twin, twin);
  await setDoc(doc(db, "profiles", uid), { twin: clean(twin) }, { merge: true });
}

/** Deletes everything in this browser and, if signed in, in the account. */
async function wipe(uid?: string) {
  Object.values(LOCAL).forEach(removeLocal);
  if (!uid) return;
  // Includes collections written by earlier versions of the app.
  const collections = ["loans", "scenarios", "goals", "decision_simulations", "life_simulations"];
  const refs: DocumentReference[] = [doc(db, "profiles", uid)];
  for (const name of collections) {
    const snapshot = await getDocs(collection(db, "users", uid, name));
    refs.push(...snapshot.docs.map((d) => d.ref));
  }
  await Promise.all(refs.map((ref) => deleteDoc(ref)));
}

export function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const key = (name: string, uid?: string) => [name, uid ?? "local"] as const;

// ---------- hooks ----------

function useList<T extends Item>(name: ListName) {
  const { user, loading: authLoading } = useAuth();
  const uid = user?.uid;
  const q = useQuery({
    queryKey: key(name, uid),
    enabled: !authLoading,
    queryFn: () => list<T>(name, uid),
  });
  return { ...q, items: q.data ?? [], user, loading: authLoading || q.isPending };
}

function useListMutations<T extends Item>(name: ListName) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: key(name, user?.uid) });
  return {
    save: useMutation({
      mutationFn: (item: T) => put(name, user?.uid, item),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => remove(name, user?.uid, id),
      onSuccess: invalidate,
    }),
  };
}

export function useLoans() {
  const r = useList<Loan>("loans");
  return { ...r, loans: r.items };
}

export function useLoan(id: string) {
  const r = useLoans();
  return { ...r, loan: r.loans.find((l) => l.id === id) };
}

export const useSaveLoan = () => useListMutations<Loan>("loans").save;
export const useDeleteLoan = () => useListMutations<Loan>("loans").remove;

export function useScenarios() {
  const r = useList<Scenario>("scenarios");
  return { ...r, scenarios: r.items };
}

export const useScenarioMutations = () => useListMutations<Scenario>("scenarios");

export function useTwin() {
  const { user, loading: authLoading } = useAuth();
  const uid = user?.uid;
  const q = useQuery({
    queryKey: key("twin", uid),
    enabled: !authLoading,
    queryFn: () => readTwin(uid),
  });
  return { ...q, twin: q.data ?? null, user, loading: authLoading || q.isPending };
}

export function useSaveTwin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (twin: Twin) => writeTwin(user?.uid, twin),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key("twin", user?.uid) }),
  });
}

export function useDeleteAllData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => wipe(user?.uid),
    onSuccess: () => queryClient.clear(),
  });
}

/** Mounted once at the root: moves locally entered data into the account after sign-in. */
export function useMoveLocalDataOnSignIn() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return;
    const loans = readLocal<Loan[]>(LOCAL.loans, []);
    const scenarios = readLocal<Scenario[]>(LOCAL.scenarios, []);
    const twin = readLocal<Twin | null>(LOCAL.twin, null);
    if (!loans.length && !scenarios.length && !twin) return;

    (async () => {
      try {
        // The account's own twin wins; only fill it in if the account has none yet.
        if (twin && !(await readTwin(uid))) await writeTwin(uid, twin);
        await Promise.all([
          ...loans.map((l) => put("loans", uid, l)),
          ...scenarios.map((s) => put("scenarios", uid, s)),
        ]);
        Object.values(LOCAL).forEach(removeLocal);
        await queryClient.invalidateQueries();
        toast.success("Moved what you entered on this device into your account");
      } catch {
        toast.error("Couldn't move this device's data into your account. It's still saved here.");
      }
    })();
  }, [uid, queryClient]);
}

/** Everything, for the "download my data" export. */
export function useExport() {
  const { twin } = useTwin();
  const { loans } = useLoans();
  const { scenarios } = useScenarios();
  return { twin, loans, scenarios, hasData: !!twin || loans.length > 0 || scenarios.length > 0 };
}
