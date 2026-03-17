import React, { useState, useEffect, useRef } from 'react'
import { Activity, Shield, Users, Terminal, Globe, Zap } from 'lucide-react'
import './App.css'

function App() {
  const [peers, setPeers] = useState([])
  const [logs, setLogs] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [metrics, setMetrics] = useState({
    pushed: 0,
    received: 0,
    threats: 0
  })
  
  const ws = useRef(null)

  useEffect(() => {
    const token = 'rootspace_dev_key' // Default dev key
    ws.current = new WebSocket(`ws://localhost:3000?token=${token}`)
    
    ws.current.onopen = () => {
      setIsConnected(true)
      addLog('Connection established to RootSpace Daemon')
    }

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      
      if (msg.type === 'peer_event') {
        if (msg.action === 'connected' || msg.action === 'discovered') {
          setPeers(prev => [...new Set([...prev, msg.peerId])])
          addLog(`Node discovered: ${msg.peerId.slice(-8)}...`)
        } else if (msg.action === 'disconnected') {
          setPeers(prev => prev.filter(id => id !== msg.peerId))
          addLog(`Node lost: ${msg.peerId.slice(-8)}...`)
        }
      } else if (msg.type === 'p2p_message') {
        addLog(`[${msg.topic}] Message from ${msg.sender.slice(-8)}...`, 'publish')
        setMetrics(prev => ({ ...prev, received: prev.received + 1 }))
      }
    }

    ws.current.onclose = () => {
      setIsConnected(false)
      addLog('Disconnected from Daemon', 'error')
    }

    return () => ws.current?.close()
  }, [])

  const addLog = (text, type = 'info') => {
    setLogs(prev => [{ id: Date.now(), text, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 50))
  }

  return (
    <div className="dashboard">
      <header>
        <div className="title">RootSpace // Command</div>
        <div className="status-badge">
          <div className={isConnected ? "pulse" : ""} style={{ background: isConnected ? '#00ff41' : '#ff3b3b' }}></div>
          {isConnected ? 'LIVE' : 'OFFLINE'}
        </div>
      </header>

      <div className="panel">
        <div className="panel-header"><Users size={14} style={{ marginRight: 8 }} /> Active Peers</div>
        <div className="content">
          <div className="peer-list">
            {peers.length === 0 ? (
              <div style={{ color: '#555', fontSize: '0.8rem' }}>Waiting for peer discovery...</div>
            ) : peers.map(id => (
              <div key={id} className="peer-item">
                <div className="avatar"></div>
                <div className="peer-id">{id}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="central-map">
        <div className="map-placeholder">
          <Globe size={120} strokeWidth={0.5} style={{ marginBottom: 20 }} />
          <div style={{ letterSpacing: 4 }}>P2P SWARM MAP</div>
        </div>
        {/* Real visualization would go here, e.g. D3.js or canvas */}
      </div>

      <div className="panel">
        <div className="panel-header"><Activity size={14} style={{ marginRight: 8 }} /> Pulse Metrics</div>
        <div className="content">
          <div className="metrics">
            <div className="metric-card">
              <div className="metric-label">Peers</div>
              <div className="metric-value">{peers.length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Ingress</div>
              <div className="metric-value">{metrics.received}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Threats</div>
              <div className="metric-value">{metrics.threats}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Latency</div>
              <div className="metric-value">42ms</div>
            </div>
          </div>
          
          <div style={{ marginTop: 20, padding: 10, background: 'rgba(0, 255, 65, 0.05)', borderRadius: 4, border: '1px solid var(--border)' }}>
            <div className="metric-label" style={{ color: 'var(--accent)' }}>System Integrity</div>
            <div style={{ height: 4, background: '#1a1a1a', borderRadius: 2, marginTop: 5, overflow: 'hidden' }}>
              <div style={{ width: '94%', height: '100%', background: 'var(--accent)' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ gridColumn: 'span 3' }}>
        <div className="panel-header"><Terminal size={14} style={{ marginRight: 8 }} /> Global Intelligence Stream</div>
        <div className="content">
          <div className="log-stream">
            {logs.map(log => (
              <div key={log.id} className={`log-entry ${log.type}`}>
                <span>[{log.time}]</span> {log.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
