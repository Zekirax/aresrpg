import net from 'net'

declare module 'minecraft-protocol' {
  interface ServerOptions {
    favicon: string
  }

  interface Server {
    socketServer: net.Server
  }

  interface Client {
    end(reason: string, fullReason: string): void
  }
}

declare module 'minecraft-data' {
  interface IndexedData {
    loginPacket: any
  }
}
