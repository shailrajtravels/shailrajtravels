import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Check, AlertTriangle, X, Bot, Loader2 } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useRole } from '../hooks/useRole';
import { useBotRulesQuery, useUpdateBotRulesMutation } from '../hooks/queries';
import { PageHeader } from '../components/PageHeader';
import type { ChatbotRule } from '../services/api';
import './Webhooks.css'; // Reuse styles from webhooks for modals/lists if possible, or we can use inline styles

export function BotRules() {
  const { t } = useTranslation();
  useDocumentTitle(t('botRules.title'));
  const { canWrite } = useRole();
  const { data, isLoading } = useBotRulesQuery();
  const updateMutation = useUpdateBotRulesMutation();

  const [rules, setRules] = useState<ChatbotRule[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const [currentRule, setCurrentRule] = useState<{ keywords: string; reply: string }>({ keywords: '', reply: '' });
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (data?.rules) {
      setRules(data.rules);
    }
  }, [data]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleOpenCreate = () => {
    setEditingIndex(null);
    setCurrentRule({ keywords: '', reply: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    setCurrentRule({
      keywords: rules[index].keywords.join(', '),
      reply: rules[index].reply,
    });
    setShowModal(true);
  };

  const handleOpenDelete = (index: number) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const handleSaveRule = async () => {
    if (!currentRule.keywords.trim() || !currentRule.reply.trim()) return;

    const keywordsArray = currentRule.keywords
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(k => k);

    let newRules = [...rules];
    if (editingIndex !== null) {
      newRules[editingIndex] = { keywords: keywordsArray, reply: currentRule.reply };
    } else {
      newRules.push({ keywords: keywordsArray, reply: currentRule.reply });
    }

    try {
      await updateMutation.mutateAsync({ rules: newRules });
      setRules(newRules);
      setShowModal(false);
      setToast({ type: 'success', message: t('botRules.toasts.saved') });
    } catch (err) {
      setToast({
        type: 'error',
        message: t('botRules.toasts.saveFailed', { message: err instanceof Error ? err.message : t('common.unknownError') }),
      });
    }
  };

  const handleDeleteRule = async () => {
    if (deleteIndex === null) return;
    
    const newRules = rules.filter((_, i) => i !== deleteIndex);
    try {
      await updateMutation.mutateAsync({ rules: newRules });
      setRules(newRules);
      setShowDeleteModal(false);
      setDeleteIndex(null);
      setToast({ type: 'success', message: t('botRules.toasts.deleted') });
    } catch (err) {
      setToast({
        type: 'error',
        message: t('botRules.toasts.saveFailed', { message: err instanceof Error ? err.message : t('common.unknownError') }),
      });
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="webhooks-page">
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      <PageHeader
        title={t('botRules.title')}
        subtitle={t('botRules.subtitle')}
        actions={
          canWrite && (
            <button className="btn-primary" onClick={handleOpenCreate}>
              <Plus size={18} />
              {t('botRules.newRule')}
            </button>
          )
        }
      />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingIndex !== null ? t('botRules.editRule') : t('botRules.newRule')}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <label>{t('botRules.keywords')}</label>
              <input
                type="text"
                placeholder={t('botRules.keywordsPlaceholder')}
                value={currentRule.keywords}
                onChange={e => setCurrentRule({ ...currentRule, keywords: e.target.value })}
              />
              <label>{t('botRules.reply')}</label>
              <textarea
                placeholder={t('botRules.replyPlaceholder')}
                value={currentRule.reply}
                onChange={e => setCurrentRule({ ...currentRule, reply: e.target.value })}
                rows={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  resize: 'vertical',
                  fontSize: '0.95rem',
                  marginTop: '0.25rem',
                }}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                {t('common.cancel')}
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSaveRule}
                disabled={!currentRule.keywords.trim() || !currentRule.reply.trim()}
              >
                {t('botRules.saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && deleteIndex !== null && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('botRules.deleteTitle')}</h2>
              <button className="btn-icon" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>{t('botRules.deleteConfirm')}</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                {t('common.cancel')}
              </button>
              <button className="btn-danger" onClick={handleDeleteRule}>
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="webhooks-content">
        <div className="webhooks-list-container">
          {rules.length === 0 ? (
            <div className="empty-table-state">
              <Bot size={48} strokeWidth={1} />
              <h3>{t('botRules.empty.title')}</h3>
              <p>{t('botRules.empty.description')}</p>
            </div>
          ) : (
            <div className="webhooks-card-list">
              {rules.map((rule, i) => (
                <div key={i} className="webhook-card">
                  <div className="webhook-card-header">
                    <div className="webhook-url-row" style={{ flexWrap: 'wrap', gap: '8px' }}>
                      {rule.keywords.map((kw, idx) => (
                        <span key={idx} className="event-tag selected">
                          {kw}
                        </span>
                      ))}
                    </div>
                    <div className="webhook-card-actions">
                      {canWrite && (
                        <>
                          <button className="icon-btn" title={t('common.edit')} onClick={() => handleOpenEdit(i)}>
                            <Edit size={16} />
                          </button>
                          <button
                            className="icon-btn danger"
                            title={t('common.delete')}
                            onClick={() => handleOpenDelete(i)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="webhook-card-body">
                    <div style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                      {rule.reply}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
