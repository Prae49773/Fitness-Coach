export async function login(email, password) {
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  const user = users.find(u => u.email === email && u.password === password)
  
  if (!user) {
    throw new Error('Invalid email or password')
  }
  
  return user
}

export async function register(email, password) {
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  
  if (users.some(u => u.email === email)) {
    throw new Error('Email already registered')
  }
  
  const newUser = {
    id: Date.now(),
    email,
    password,
    role: 'user',
    onboarding_completed: false,
    created_at: new Date().toISOString()
  }
  
  users.push(newUser)
  localStorage.setItem('users', JSON.stringify(users))
  
  return newUser
}

export async function updateUser(id, updates) {
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  const index = users.findIndex(u => u.id === id)
  
  if (index === -1) {
    throw new Error('User not found')
  }
  
  users[index] = { ...users[index], ...updates }
  localStorage.setItem('users', JSON.stringify(users))
  
  return users[index]
}

export async function getAllUsers() {
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  return users
}
