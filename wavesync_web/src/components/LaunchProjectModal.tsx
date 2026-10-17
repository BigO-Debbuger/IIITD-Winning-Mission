// wavesync_web/src/components/LaunchProjectModal.tsx
import React, { useState } from 'react';
import { api, CollabProject } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import { Rocket, AlertCircle, Loader2, Plus } from 'lucide-react';

interface LaunchProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: CollabProject) => void;
}

export const LaunchProjectModal: React.FC<LaunchProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [projectStage, setProjectStage] = useState('Concept Stage');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onClose();
      openAuthModal('login');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setError('Please provide both a project title and description.');
      return;
    }

    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (skills.length === 0) {
      setError('Please specify at least one skill required (comma separated).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const created = await api.createCollabPost({
        title: title.trim(),
        description: description.trim(),
        skillsRequired: skills,
        projectStage,
      });
      onProjectCreated(created);
      // Reset form
      setTitle('');
      setDescription('');
      setSkillsInput('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Launch New Project"
      subtitle="Post an initiative and attract verified co-founders"
      maxWidth={540}
      icon={
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'var(--accent-coral)',
            display: 'grid',
            placeItems: 'center',
            borderRadius: 'inherit',
          }}
        >
          <Rocket size={20} color="#FFFFFF" />
        </div>
      }
    >
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: '#FFF1F0',
            border: '2px solid #FF4B2F',
            color: '#B91C1C',
            fontSize: '0.84rem',
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 6,
            }}
          >
            Project Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. WaveMesh — Verifiable P2P Compute Node"
            className="form-input"
            required
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 6,
            }}
          >
            Project Stage
          </label>
          <select
            value={projectStage}
            onChange={(e) => setProjectStage(e.target.value)}
            className="form-input"
          >
            <option value="Concept Stage">Concept Stage</option>
            <option value="Prototype Stage">Prototype Stage</option>
            <option value="MVP in Development">MVP in Development</option>
            <option value="Grant-Funded">Grant-Funded</option>
            <option value="Beta Production">Beta Production</option>
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 6,
            }}
          >
            Description & Vision *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain the technical problem, current progress, and what you are building..."
            rows={4}
            className="form-input"
            style={{ resize: 'vertical' }}
            required
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 6,
            }}
          >
            Required Skills (comma separated) *
          </label>
          <input
            type="text"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="e.g. Rust, WebGL, TypeScript, Distributed Systems"
            className="form-input"
            required
          />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            style={{ minHeight: 42, padding: '0 20px' }}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-dark"
            style={{ minHeight: 42, padding: '0 24px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin-animate" /> Launching...
              </>
            ) : (
              <>
                <Plus size={16} /> Publish Project
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
