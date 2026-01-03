
import { ChatMessage, ReactionType, UserProfile, PlayerSymbol } from '../types';

/**
 * Represents a simplified mock WebSocket connection.
 * In a real application, this would handle actual WebSocket communication.
 */
export class WebSocketService {
  private ws: {
    send: (message: string) => void;
    onmessage: ((event: MessageEvent) => void) | null;
    onopen: (() => void) | null;
    onclose: (() => void) | null;
    onerror: ((event: Event) => void) | null;
    close: () => void;
  } | null = null;
  private messageListeners: Function[] = [];
  private openListeners: Function[] = [];
  private closeListeners: Function[] = [];
  private errorListeners: Function[] = [];
  private isConnected = false;

  constructor(private url: string = 'ws://localhost:8080/tictactoe') {
    // This is a mock constructor. In a real app, 'url' would be used.
    console.log(`Mock WebSocketService initialized for ${this.url}`);
  }

  /**
   * Connects to the mock WebSocket server.
   */
  public connect(): void {
    console.log('Attempting to connect to mock WebSocket...');
    // Simulate connection delay
    setTimeout(() => {
      this.ws = {
        send: (message: string) => {
          console.log('Mock WS Send:', message);
          // Simulate receiving a message after sending one
          setTimeout(() => {
            const parsed = JSON.parse(message);
            if (parsed.type === 'CHAT_MESSAGE') {
                const response: ChatMessage = {
                    id: `msg-${Date.now()}-mock`,
                    sender: 'ServerBot',
                    text: `Echo: "${parsed.payload.text}"`,
                    timestamp: new Date().toISOString(),
                };
                this.handleIncomingMessage({ data: JSON.stringify({ type: 'CHAT_MESSAGE', payload: response }) } as MessageEvent);
            } else if (parsed.type === 'GAME_MOVE') {
                // Simulate a very basic AI response for online multiplayer
                const { board, player } = parsed.payload;
                const nextPlayer = player === PlayerSymbol.X ? PlayerSymbol.O : PlayerSymbol.X;
                const availableMoves = board.map((cell: PlayerSymbol | null, idx: number) => cell === null ? idx : null).filter((idx: number | null) => idx !== null);
                if (availableMoves.length > 0) {
                    const aiMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
                    const updatedBoard = [...board];
                    updatedBoard[aiMove] = nextPlayer;
                    this.handleIncomingMessage({
                        data: JSON.stringify({
                            type: 'GAME_STATE_UPDATE',
                            payload: { board: updatedBoard, currentPlayer: player, lastMove: { index: aiMove, player: nextPlayer } }
                        })
                    } as MessageEvent);
                }
            }
          }, 500);
        },
        onmessage: null, // Will be set by this class
        onopen: null,   // Will be set by this class
        onclose: null,  // Will be set by this class
        onerror: null,  // Will be set by this class
        close: () => {
          console.log('Mock WS Closed');
          this.isConnected = false;
          this.closeListeners.forEach(listener => listener());
          this.ws = null;
        }
      };
      this.isConnected = true;
      this.openListeners.forEach(listener => listener());
      console.log('Mock WebSocket connected.');
    }, 1000); // Simulate network delay
  }

  /**
   * Disconnects from the mock WebSocket.
   */
  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      console.log('Mock WebSocket disconnected.');
    }
  }

  /**
   * Sends a message through the mock WebSocket.
   * @param type The type of the message (e.g., 'CHAT_MESSAGE', 'GAME_MOVE').
   * @param payload The data payload of the message.
   */
  public sendMessage(type: string, payload: any): void {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket not connected. Message not sent:', { type, payload });
    }
  }

  /**
   * Registers a callback for incoming messages.
   * @param listener The function to call when a message is received.
   */
  public onMessage(listener: (message: any) => void): () => void {
    this.messageListeners.push(listener);
    return () => this.messageListeners = this.messageListeners.filter(l => l !== listener);
  }

  /**
   * Registers a callback for when the WebSocket connection opens.
   * @param listener The function to call on open.
   */
  public onOpen(listener: () => void): () => void {
    this.openListeners.push(listener);
    if (this.isConnected) {
      listener(); // Call immediately if already connected
    }
    return () => this.openListeners = this.openListeners.filter(l => l !== listener);
  }

  /**
   * Registers a callback for when the WebSocket connection closes.
   * @param listener The function to call on close.
   */
  public onClose(listener: () => void): () => void {
    this.closeListeners.push(listener);
    return () => this.closeListeners = this.closeListeners.filter(l => l !== listener);
  }

  /**
   * Registers a callback for WebSocket errors.
   * @param listener The function to call on error.
   */
  public onError(listener: (event: Event) => void): () => void {
    this.errorListeners.push(listener);
    return () => this.errorListeners = this.errorListeners.filter(l => l !== listener);
  }

  /**
   * Internal handler for incoming mock messages.
   * @param event The mock MessageEvent.
   */
  private handleIncomingMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      this.messageListeners.forEach(listener => listener(data));
    } catch (e) {
      console.error('Failed to parse incoming mock WebSocket message:', e);
    }
  }

  public getIsConnected(): boolean {
      return this.isConnected;
  }

  // --- Mock API for online features ---

  // Mock for user authentication
  public async login(username: string): Promise<UserProfile> {
    console.log(`Mock login for ${username}`);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          id: `usr-${username}-${Date.now()}`,
          username,
          avatarUrl: `https://picsum.photos/50/50?random=${Date.now()}`,
          onlineStatus: 'online',
          stats: { wins: Math.floor(Math.random() * 10), losses: Math.floor(Math.random() * 10), draws: Math.floor(Math.random() * 5) },
          elo: 1200 + Math.floor(Math.random() * 200),
        });
      }, 500);
    });
  }

  // Mock for fetching friends list
  public async getFriends(): Promise<UserProfile[]> {
    console.log('Mock fetching friends list');
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { id: 'friend1', username: 'Alice', avatarUrl: 'https://picsum.photos/50/50?random=1', onlineStatus: 'online', stats: { wins: 5, losses: 2, draws: 1 }, elo: 1350 },
          { id: 'friend2', username: 'Bob', avatarUrl: 'https://picsum.photos/50/50?random=2', onlineStatus: 'offline', stats: { wins: 3, losses: 7, draws: 2 }, elo: 1100 },
          { id: 'friend3', username: 'Charlie', avatarUrl: 'https://picsum.photos/50/50?random=3', onlineStatus: 'away', stats: { wins: 8, losses: 1, draws: 0 }, elo: 1420 },
        ]);
      }, 700);
    });
  }

  // Mock for sending reactions
  public sendReaction(reaction: ReactionType): void {
    console.log('Mock sending reaction:', reaction);
    // In a real app, this would send a WebSocket message
  }
}

// Export a singleton instance for simplicity in this frontend app
export const webSocketService = new WebSocketService();
