import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, ShieldAlert, Clock, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { SecurityAlert } from '../../types/database';

export const NotificationsSection = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchAlerts = async () => {
      if (user && mounted) {
        await loadAlerts();
      }
    };

    fetchAlerts();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('security_alerts')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;
      await loadAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const handleDelete = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('security_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;
      await loadAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'compromised':
        return ShieldAlert;
      case 'weak':
        return AlertTriangle;
      case 'old':
        return Clock;
      default:
        return Bell;
    }
  };

  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Centro de Notificaciones</h2>
            <p className="text-sm text-gray-600">
              {unresolvedAlerts.length} alertas sin resolver
            </p>
          </div>
        </div>

        {unresolvedAlerts.length === 0 && resolvedAlerts.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No tienes notificaciones</p>
          </div>
        ) : (
          <div className="space-y-6">
            {unresolvedAlerts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sin resolver</h3>
                <div className="space-y-3">
                  {unresolvedAlerts.map((alert) => {
                    const Icon = getAlertIcon(alert.alert_type);
                    return (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium mb-1">{alert.message}</p>
                            <p className="text-xs opacity-75">
                              {new Date(alert.created_at).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleResolve(alert.id)}
                              className="p-2 hover:bg-white/50 rounded-lg transition"
                              title="Marcar como resuelto"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(alert.id)}
                              className="p-2 hover:bg-white/50 rounded-lg transition"
                              title="Eliminar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {resolvedAlerts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resueltas</h3>
                <div className="space-y-3">
                  {resolvedAlerts.map((alert) => {
                    const Icon = getAlertIcon(alert.alert_type);
                    return (
                      <div
                        key={alert.id}
                        className="p-4 rounded-lg border border-gray-200 bg-gray-50 opacity-60"
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-600" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium mb-1 text-gray-700">{alert.message}</p>
                            <p className="text-xs text-gray-500">
                              Resuelta el{' '}
                              {new Date(alert.resolved_at!).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDelete(alert.id)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition"
                            title="Eliminar"
                          >
                            <X className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
