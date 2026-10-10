// Loan + settings storage. Signed-out users keep everything in this browser (localStorage);
// signed-in users keep it in Firestore under users/{uid}. When someone signs in, anything
// they entered locally is moved into their account.
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

export type Settings = { takeHome: number | null };

const LOCAL_LOANS = "fintwin.loans.v1";
const LOCAL_SETTINGS = "fintwin.settings.v1";

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

const byCreated = (a: Loan, b: Loan) => a.createdAt.localeCompare(b.createdAt);

async function listLoans(uid?: string): Promise<Loan[]> {
  if (!uid) return readLocal<Loan[]>(LOCAL_LOANS, []).sort(byCreated);
  const snapshot = await getDocs(collection(db, "users", uid, "loans"));
  return snapshot.docs.map((d) => d.data() as Loan).sort(byCreated);
}

async function putLoan(uid: string | undefined, loan: Loan) {
  if (!uid) {
    const loans = readLocal<Loan[]>(LOCAL_LOANS, []).filter((l) => l.id !== loan.id);
    writeLocal(LOCAL_LOANS, [...loans, loan]);
    return;
  }
  await setDoc(doc(db, "users", uid, "loans", loan.id), clean(loan));
}

async function removeLoan(uid: string | undefined, id: string) {
  if (!uid) {
    writeLocal(
      LOCAL_LOANS,
      readLocal<Loan[]>(LOCAL_LOANS, []).filter((l) => l.id !== id),
    );
    return;
  }
  await deleteDoc(doc(db, "users", uid, "loans", id));
}

async function readSettings(uid?: string): Promise<Settings> {
  if (!uid) return readLocal<Settings>(LOCAL_SETTINGS, { takeHome: null });
  const snapshot = await getDoc(doc(db, "profiles", uid));
  const takeHome = snapshot.data()?.take_home;
  return { takeHome: typeof takeHome === "number" ? takeHome : null };
}

async function writeSettings(uid: string | undefined, s: Settings) {
  if (!uid) return writeLocal(LOCAL_SETTINGS, s);
  await setDoc(doc(db, "profiles", uid), { take_home: s.takeHome }, { merge: true });
}

/** Deletes every loan and setting in this browser and, if signed in, in the account. */
async function wipe(uid?: string) {
  removeLocal(LOCAL_LOANS);
  removeLocal(LOCAL_SETTINGS);
  if (!uid) return;
  // Includes collections written by earlier versions of the app.
  const collections = ["loans", "goals", "decision_simulations", "life_simulations"];
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

export const loansKey = (uid?: string) => ["loans", uid ?? "local"] as const;
export const settingsKey = (uid?: string) => ["settings", uid ?? "local"] as const;

export function useLoans() {
  const { user, loading: authLoading } = useAuth();
  const uid = user?.uid;
  const q = useQuery({
    queryKey: loansKey(uid),
    enabled: !authLoading,
    queryFn: () => listLoans(uid),
  });
  return { ...q, loans: q.data ?? [], user, loading: authLoading || q.isPending };
}

export function useLoan(id: string) {
  const r = useLoans();
  return { ...r, loan: r.loans.find((l) => l.id === id) };
}

export function useSettings() {
  const { user, loading: authLoading } = useAuth();
  const uid = user?.uid;
  const q = useQuery({
    queryKey: settingsKey(uid),
    enabled: !authLoading,
    queryFn: () => readSettings(uid),
  });
  return {
    ...q,
    settings: q.data ?? { takeHome: null },
    user,
    loading: authLoading || q.isPending,
  };
}

export function useSaveLoan() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (loan: Loan) => putLoan(user?.uid, loan),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: loansKey(user?.uid) }),
  });
}

export function useDeleteLoan() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeLoan(user?.uid, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: loansKey(user?.uid) }),
  });
}

export function useSaveSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (s: Settings) => writeSettings(user?.uid, s),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKey(user?.uid) }),
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
    const localLoans = readLocal<Loan[]>(LOCAL_LOANS, []);
    const localSettings = readLocal<Settings | null>(LOCAL_SETTINGS, null);
    if (!localLoans.length && !localSettings?.takeHome) return;

    (async () => {
      try {
        await Promise.all(localLoans.map((loan) => putLoan(uid, loan)));
        if (localSettings?.takeHome) {
          const remote = await readSettings(uid);
          if (remote.takeHome === null) await writeSettings(uid, localSettings);
        }
        removeLocal(LOCAL_LOANS);
        removeLocal(LOCAL_SETTINGS);
        await queryClient.invalidateQueries();
        if (localLoans.length) {
          toast.success(
            `Moved ${localLoans.length} loan${localLoans.length === 1 ? "" : "s"} into your account`,
          );
        }
      } catch {
        toast.error(
          "Couldn't move this browser's loans into your account. They're still saved here.",
        );
      }
    })();
  }, [uid, queryClient]);
}
