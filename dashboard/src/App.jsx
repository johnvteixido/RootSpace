import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Activity, Shield, Users, Terminal, Globe, Zap, Database } from 'lucide-react'
import { ForceGraph3D } from 'react-force-graph'
import './App.css'

function App() {
  const [peers, setPeers] = useState([])
  const [logs, setLogs] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [metrics, setMetrics] = useState({ received: 0, threats: 0, latency: '24ms' })
  const [graphData, setGraphData] = useState({ 
    nodes: [{ id: 'Local Node', color: '#00ff41', size: 20, reputation: 100 }], 
    links: [] 
  })
  
  /** @type {React.MutableRefObject<WebSocket | null>} */
  const ws = useRef(null)

  const addLog = (text, type = 'info') => {
    setLogs(prev => [{ id: Date.now(), text, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 50))
  }

  useEffect(() => {
    // In V2.0, we use the AGENT_API_KEY from the environment
    const token = 'rootspace_dev_key' 
    ws.current = new WebSocket(`ws://localhost:3000?token=${token}`)
    
    ws.current.onopen = () => {
      setIsConnected(true)
      addLog('Neural Link Established: RootSpace Swarm Active')
      // Fetch initial state
      ws.current.send(JSON.stringify({ action: 'get_peers' }))
    }

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      
      if (msg.type === 'peer_event') {
        const id = msg.peerId
        if (msg.action === 'connected' || msg.action === 'discovered') {
          setPeers(prev => [...new Set([...prev, id])])
          setGraphData(prev => ({
            nodes: [...prev.nodes, { id, reputation: 100, color: '#00ccff' }],
            links: [...prev.links, { source: 'Local Node', target: id }]
          }))
          addLog(`Node Discovery: ${id.slice(-8)}...`, 'info')
        } else if (msg.action === 'disconnected') {
          setPeers(prev => prev.filter(p => p !== id))
          setGraphData(prev => ({
            nodes: prev.nodes.filter(n => n.id !== id),
            links: prev.links.filter(l => l.target !== id)
          }))
          addLog(`Node Signal Lost: ${id.slice(-8)}...`, 'error')
        }
      } else if (msg.type === 'p2p_message') {
        addLog(`[${msg.topic}] Intel from ${msg.sender.slice(-8)}...`, 'publish')
        setMetrics(prev => ({ ...prev, received: prev.received + 1 }))
        
        // Highlight active node in graph
        setGraphData(prev => ({
          ...prev,
          nodes: prev.nodes.map(n => n.id === msg.sender ? { ...n, color: '#ff00ff' } : n)
        }))
        setTimeout(() => {
          setGraphData(prev => ({
            ...prev,
            nodes: prev.nodes.map(n => n.id === msg.sender ? { ...n, color: '#00ccff' } : n)
          }))
        }, 1000)
      } else if (msg.status === 'success' && msg.peers) {
        // Handle initial peers batch
        const nodes = [{ id: 'Local Node', color: '#00ff41', size: 20 }]
        const links = []
        msg.peers.forEach(p => {
          nodes.push({ id: p.peer_id, reputation: p.reputation, color: '#00ccff' })
          links.push({ source: 'Local Node', target: p.peer_id })
        })
        setGraphData({ nodes, links })
        setPeers(msg.peers.map(p => p.peer_id))
      }
    }

    ws.current.onclose = () => {
      setIsConnected(false)
      addLog('Neural Link Severed', 'error')
    }

    return () => ws.current?.close()
  }, [])

  return (
    <div className="dashboard">
      <header>
        <div className="title">ROOTSPACE // C2_CORE</div>
        <div className="status-badge">
          <div className={isConnected ? "pulse" : ""} style={{ background: isConnected ? '#00ff41' : '#ff3b3b' }}></div>
          {isConnected ? 'LIVE_STREAM' : 'DISCONNECTED'}
        </div>
      </header>

      <div className="panel peers-panel">
        <div className="panel-header"><Users size={14} style={{ marginRight: 8 }} /> Global Swarm</div>
        <div className="content">
          <div className="peer-list">
            {peers.length === 0 ? (
              <div className="empty-state">No Active Nodes In Vicinity</div>
            ) : peers.map(id => (
              <div key={id} className="peer-item">
                <div className="id-tag">{id.slice(0, 16)}...</div>
                <div className="rep-tag">REP: 100</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="central-map">
        <ForceGraph3D
          graphData={graphData}
          backgroundColor="rgba(0,0,0,0)"
          nodeLabel="id"
          nodeAutoColorBy="group"
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
          showNavInfo={false}
          width={window.innerWidth * 0.5}
          height={600}
        />
      </div>

      <div className="panel metrics-panel">
        <div className="panel-header"><Activity size={14} style={{ marginRight: 8 }} /> Swarm Pulse</div>
        <div className="content">
          <div className="metrics">
            <div className="metric-card">
              <div className="label">Nodes</div>
              <div className="value">{peers.length}</div>
            </div>
            <div className="metric-card">
              <div className="label">Ingress</div>
              <div className="value">{metrics.received}</div>
            </div>
            <div className="metric-card">
              <div className="label">Threats</div>
              <div className="value">{metrics.threats}</div>
            </div>
            <div className="metric-card">
              <div className="label">Ping</div>
              <div className="value">{metrics.latency}</div>
            </div>
          </div>
          
          <div className="persistence-status">
            <div className="label"><Database size={12} /> Local Persistence</div>
            <div className="bar"><div className="fill" style={{ width: '98%' }}></div></div>
            <div className="subtext">Indexing community intelligence...</div>
          </div>
        </div>
      </div>

      <div className="panel log-panel">
        <div className="panel-header"><Terminal size={14} style={{ marginRight: 8 }} /> Neural Stream</div>
        <div className="content">
          <div className="log-stream">
            {logs.map(log => (
              <div key={log.id} className={`log-entry ${log.type}`}>
                <span className="time">[{log.time}]</span> {log.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
