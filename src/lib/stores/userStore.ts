import { writable, type Readable } from 'svelte/store'

export interface User {
  id: string
  name: string
}

export interface UserStoreState {
  users: User[]
  user: User | null
}

export interface UserStore extends Readable<UserStoreState> {
  login(name: string): void
  register(name: string): void
  logout(): void
  updateName(id: string, name: string): void
  deleteUser(id: string): void
  addMany(users: User[]): void
  clear(): void
}

const STORAGE_KEY = 'cafe-booking:user-store'

const EMPTY_STATE: UserStoreState = { users: [], user: null }

function loadState(): UserStoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_STATE
    const parsed = JSON.parse(raw) as Partial<UserStoreState>
    return {
      users: Array.isArray(parsed.users)
        ? parsed.users.map((u: User) => ({ id: u.id, name: u.name }))
        : [],
      user: parsed.user
        ? { id: parsed.user.id, name: parsed.user.name }
        : null,
    }
  } catch {
    return EMPTY_STATE
  }
}

function createUserStore(): UserStore {
  const { subscribe, update } = writable<UserStoreState>(loadState())

  subscribe((state: UserStoreState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  })

  return {
    subscribe,
    login(name: string): void {
      update((state: UserStoreState) => ({
        ...state,
        user:
          state.users.find(
            (u: User) => u.name.toLowerCase() === name.trim().toLowerCase(),
          ) ?? null,
      }))
    },
    register(name: string): void {
      const newUser: User = {
        id: crypto.randomUUID(),
        name: name.trim(),
      }
      update((state: UserStoreState) => ({
        users: [...state.users, newUser],
        user: newUser,
      }))
    },
    logout(): void {
      update((state: UserStoreState) => ({ ...state, user: null }))
    },
    updateName(id: string, name: string): void {
      const trimmed = name.trim()
      if (!trimmed) return
      update((state: UserStoreState) => ({
        users: state.users.map((u: User) =>
          u.id === id ? { ...u, name: trimmed } : u,
        ),
        user:
          state.user?.id === id
            ? { ...state.user, name: trimmed }
            : state.user,
      }))
    },
    deleteUser(id: string): void {
      update((state: UserStoreState) => ({
        users: state.users.filter((u: User) => u.id !== id),
        user: state.user?.id === id ? null : state.user,
      }))
    },
    addMany(newUsers: User[]): void {
      update((state: UserStoreState) => ({
        ...state,
        users: [
          ...state.users.filter(
            (u: User) => !newUsers.some((n) => n.id === u.id),
          ),
          ...newUsers,
        ],
      }))
    },
    clear(): void {
      update(() => ({ users: [], user: null }))
    },
  }
}

export const userStore: UserStore = createUserStore()
