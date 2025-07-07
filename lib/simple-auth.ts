import usersData from '../data/users.json'

export interface SimpleUser {
  id: string
  email: string
  name: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export class SimpleAuthService {
  private static instance: SimpleAuthService
  private currentUser: SimpleUser | null = null

  static getInstance(): SimpleAuthService {
    if (!SimpleAuthService.instance) {
      SimpleAuthService.instance = new SimpleAuthService()
    }
    return SimpleAuthService.instance
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: SimpleUser; error?: string }> {
    const user = usersData.users.find(
      u => u.email === credentials.email && u.password === credentials.password
    )

    if (user) {
      this.currentUser = {
        id: user.id,
        email: user.email,
        name: user.name
      }
      
      // Salvar no localStorage
      localStorage.setItem('simple-auth-user', JSON.stringify(this.currentUser))
      
      return { success: true, user: this.currentUser }
    }

    return { success: false, error: 'E-mail ou senha incorretos' }
  }

  async logout(): Promise<void> {
    this.currentUser = null
    localStorage.removeItem('simple-auth-user')
  }

  getCurrentUser(): SimpleUser | null {
    if (this.currentUser) {
      return this.currentUser
    }

    // Tentar recuperar do localStorage
    const storedUser = localStorage.getItem('simple-auth-user')
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser)
        return this.currentUser
      } catch (error) {
        console.error('Erro ao parsear usuário do localStorage:', error)
        localStorage.removeItem('simple-auth-user')
      }
    }

    return null
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }
}

export const simpleAuth = SimpleAuthService.getInstance() 