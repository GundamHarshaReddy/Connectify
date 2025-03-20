import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  isRead: boolean
}

export interface Conversation {
  id: string
  participants: string[]
  messages: Message[]
  lastUpdated: string
}

// Directory to store temporary conversation files
const TEMP_DIR = path.join(process.cwd(), 'temp', 'conversations')

// Ensure temp directory exists
export async function ensureTempDir() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true })
  } catch (error) {
    console.error('Error creating temp directory:', error)
  }
}

// Get conversation file path
function getConversationPath(conversationId: string): string {
  return path.join(TEMP_DIR, `${conversationId}.json`)
}

// Create a new conversation
export async function createConversation(userIds: string[]): Promise<Conversation> {
  await ensureTempDir()
  
  const conversation: Conversation = {
    id: uuidv4(),
    participants: userIds,
    messages: [],
    lastUpdated: new Date().toISOString()
  }
  
  await fs.writeFile(
    getConversationPath(conversation.id),
    JSON.stringify(conversation, null, 2)
  )
  
  return conversation
}

// Get a conversation by ID
export async function getConversation(conversationId: string): Promise<Conversation | null> {
  try {
    const data = await fs.readFile(getConversationPath(conversationId), 'utf-8')
    return JSON.parse(data) as Conversation
  } catch (error) {
    return null
  }
}

// Get all conversations for a specific user
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  await ensureTempDir()
  
  try {
    const files = await fs.readdir(TEMP_DIR)
    const conversations: Conversation[] = []
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue
      
      try {
        const data = await fs.readFile(path.join(TEMP_DIR, file), 'utf-8')
        const conversation = JSON.parse(data) as Conversation
        
        if (conversation.participants.includes(userId)) {
          conversations.push(conversation)
        }
      } catch (error) {
        console.error(`Error reading conversation file ${file}:`, error)
      }
    }
    
    return conversations.sort((a, b) => 
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    )
  } catch (error) {
    console.error('Error reading conversations directory:', error)
    return []
  }
}

// Add a message to a conversation
export async function addMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message | null> {
  try {
    const conversation = await getConversation(message.conversationId)
    if (!conversation) return null
    
    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      isRead: false
    }
    
    conversation.messages.push(newMessage)
    conversation.lastUpdated = newMessage.timestamp
    
    await fs.writeFile(
      getConversationPath(conversation.id),
      JSON.stringify(conversation, null, 2)
    )
    
    return newMessage
  } catch (error) {
    console.error('Error adding message:', error)
    return null
  }
}

// Mark messages as read
export async function markMessagesAsRead(conversationId: string, userId: string): Promise<boolean> {
  try {
    const conversation = await getConversation(conversationId)
    if (!conversation) return false
    
    let updated = false
    
    conversation.messages.forEach(message => {
      if (message.receiverId === userId && !message.isRead) {
        message.isRead = true
        updated = true
      }
    })
    
    if (updated) {
      await fs.writeFile(
        getConversationPath(conversationId),
        JSON.stringify(conversation, null, 2)
      )
    }
    
    return updated
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return false
  }
}

// Delete a conversation
export async function deleteConversation(conversationId: string): Promise<boolean> {
  try {
    await fs.unlink(getConversationPath(conversationId))
    return true
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return false
  }
}
