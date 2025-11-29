import React, { useCallback, useMemo, useState } from 'react';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const composeClient = axios.create({ baseURL: '/api' });

const agentPlaybooks = [
  {
    name: 'Start + verify',
    actions: ['start', 'status'],
    description: 'Boot the stack and confirm every service reports healthy via compose.',
  },
  {
    name: 'Graceful restart',
    actions: ['stop', 'start', 'status'],
    description: 'Tear down cleanly, then bring the stack back up with a fresh status snapshot.',
  },
  {
    name: 'Status only',
    actions: ['status'],
    description: 'Lightweight 2025-ready audit to see what Compose reports right now.',
  },
];

function useComposeStatus() {
  return useQuery({
    queryKey: ['compose-status'],
    refetchInterval: 15_000,
    queryFn: async () => {
      const res = await composeClient.get('/compose/status');
      return res.data;
    },
  });
}

function StatusTable({ summary }) {
  if (!summary || summary.length === 0) return <p className="muted">Compose did not return structured service data.</p>;

  return (
    <div className="table" role="table">
      <div className="table-row table-head" role="row">
        <div role="columnheader">Service</div>
        <div role="columnheader">State</div>
        <div role="columnheader">Health</div>
      </div>
      {summary.map((service) => (
        <div key={service.Service || service.Name} className="table-row" role="row">
          <div role="cell">{service.Service || service.Name}</div>
          <div role="cell" className={service.State?.includes('running') ? 'pill success' : 'pill warning'}>
            {service.State || 'unknown'}
          </div>
          <div role="cell" className={service.Health ? 'pill success' : 'pill muted'}>
            {service.Health?.Status || service.Health || 'n/a'}
          </div>
        </div>
      ))}
    </div>
  );
}

function BestPractices() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['best-practices'],
    queryFn: async () => {
      const res = await composeClient.get('/best-practices');
      return res.data;
    },
  });

  if (isLoading) return <p className="muted">Loading 11/2025 best practices…</p>;
  if (isError) return <p className="error">Could not load best practices.</p>;

  return (
    <div className="grid">
      {data.items.map((item) => (
        <article key={item.title} className="card">
          <h3>{item.title}</h3>
          <p>{item.detail}</p>
        </article>
      ))}
    </div>
  );
}

function ComposeActions() {
  const queryClient = useQueryClient();
  const [log, setLog] = useState('');

  const mutation = useMutation({
    mutationFn: async (action) => {
      const res = await composeClient.post(`/compose/${action}`);
      return { action, data: res.data };
    },
    onSuccess: async ({ action, data }) => {
      setLog((prev) => `${new Date().toLocaleTimeString()} • ${action}: ${data.raw || data.message}\n${prev}`);
      await queryClient.invalidateQueries({ queryKey: ['compose-status'] });
    },
    onError: (error, action) => {
      const description = error.response?.data?.error || error.message;
      setLog((prev) => `${new Date().toLocaleTimeString()} • ${action} failed: ${description}\n${prev}`);
    },
  });

  const runAction = useCallback((action) => mutation.mutate(action), [mutation]);

  return (
    <section className="card">
      <header className="card-header">
        <div>
          <p className="eyebrow">Compose control</p>
          <h2>Agentic controls</h2>
          <p className="muted">Start, stop, or restart the stack with guardrails to prevent ad-hoc shelling.</p>
        </div>
        <div className="button-row">
          <button disabled={mutation.isPending} onClick={() => runAction('status')} className="ghost">
            Status
          </button>
          <button disabled={mutation.isPending} onClick={() => runAction('start')}>
            Start
          </button>
          <button disabled={mutation.isPending} onClick={() => runAction('stop')} className="danger">
            Stop
          </button>
          <button disabled={mutation.isPending} onClick={() => runAction('restart')} className="secondary">
            Restart
          </button>
        </div>
      </header>
      <pre className="log-window">{log || 'Actions and compose output will appear here.'}</pre>
    </section>
  );
}

function AgentPlaybook() {
  const [selected, setSelected] = useState(agentPlaybooks[0]);
  const [history, setHistory] = useState([]);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await composeClient.post('/agent/batch', payload);
      return res.data.completed;
    },
    onSuccess: (completed) => {
      setHistory(completed);
    },
  });

  const runPlaybook = useCallback(() => {
    mutation.mutate({ actions: selected.actions });
  }, [mutation, selected]);

  return (
    <section className="card">
      <header className="card-header">
        <div>
          <p className="eyebrow">Automation</p>
          <h2>Agentic playbooks</h2>
          <p className="muted">Pre-baked sequences for safe, repeatable operations that align with 2025 hardening guidance.</p>
        </div>
        <div className="playbook-select">
          <label htmlFor="playbook">Playbook</label>
          <select
            id="playbook"
            value={selected.name}
            onChange={(e) => setSelected(agentPlaybooks.find((p) => p.name === e.target.value))}
          >
            {agentPlaybooks.map((playbook) => (
              <option key={playbook.name} value={playbook.name}>
                {playbook.name}
              </option>
            ))}
          </select>
          <button onClick={runPlaybook} disabled={mutation.isPending} className="secondary">
            Run
          </button>
        </div>
      </header>
      <p className="muted">{selected.description}</p>
      <div className="grid">
        {history.length === 0 && <p className="muted">No agent runs yet. Pick a playbook to see detailed output.</p>}
        {history.map((entry) => (
          <article key={`${entry.action}-${entry.status}`} className="card inset">
            <header className="chip-row">
              <span className="chip">{entry.action}</span>
              <span className={`chip ${entry.status === 'ok' ? 'success' : entry.status === 'error' ? 'danger' : 'muted'}`}>
                {entry.status}
              </span>
            </header>
            <pre className="log-window small">{entry.output || 'No output reported.'}</pre>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const statusQuery = useComposeStatus();

  const lastUpdated = useMemo(() => {
    if (!statusQuery.data) return null;
    return new Date().toLocaleTimeString();
  }, [statusQuery.data]);

  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Media Server Stack · November 2025 readiness</p>
          <h1>Operator console</h1>
          <p className="muted">
            Modern controls for Compose with 2025-era best practices, agentic playbooks, and guardrails to avoid brittle scripts.
          </p>
        </div>
        <div className="status-card">
          <p className="eyebrow">Status refresh</p>
          <p className="muted">{lastUpdated ? `Auto-refreshed at ${lastUpdated}` : 'Waiting for first pull…'}</p>
        </div>
      </header>

      <section className="card">
        <header className="card-header">
          <div>
            <p className="eyebrow">Stack visibility</p>
            <h2>Compose services</h2>
          </div>
          <button onClick={() => statusQuery.refetch()} className="ghost" disabled={statusQuery.isFetching}>
            Refresh
          </button>
        </header>
        {statusQuery.isError && <p className="error">Could not fetch compose status.</p>}
        {statusQuery.isLoading && <p className="muted">Loading compose status…</p>}
        {statusQuery.data && (
          <>
            <StatusTable summary={statusQuery.data.summary} />
            <details className="raw-output">
              <summary>Raw compose output</summary>
              <pre className="log-window small">{statusQuery.data.raw}</pre>
            </details>
          </>
        )}
      </section>

      <div className="layout">
        <ComposeActions />
        <AgentPlaybook />
      </div>

      <section className="card">
        <header className="card-header">
          <div>
            <p className="eyebrow">Opinionated guardrails</p>
            <h2>11/2025 best practices</h2>
            <p className="muted">High-signal recommendations to keep the stack resilient, encrypted, and maintainable.</p>
          </div>
        </header>
        <BestPractices />
      </section>
    </main>
  );
}
