import { Button } from './ui/button';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { CheckCircle, XCircle, Loader2, Server } from 'lucide-react';

export function BackendTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testBackend = async () => {
    setTesting(true);
    const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-ca4695ac/health`;
    
    const testResults = {
      projectId,
      healthUrl,
      healthCheck: null as any,
      timestamp: new Date().toISOString(),
    };

    // Test 1: Health Check
    try {
      const response = await fetch(healthUrl);
      const data = await response.json();
      testResults.healthCheck = {
        success: response.ok,
        status: response.status,
        data,
      };
    } catch (error: any) {
      testResults.healthCheck = {
        success: false,
        error: error.message,
      };
    }

    setResults(testResults);
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-slate-800/50 border-slate-700 p-8">
          <div className="flex items-center gap-4 mb-6">
            <Server className="size-12 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Backend Connection Test</h1>
              <p className="text-gray-400">Test if your Supabase Edge Function is deployed</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-400 mb-1">Project ID</div>
              <div className="text-white font-mono">{projectId}</div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Health Endpoint</div>
              <div className="text-cyan-400 font-mono text-sm break-all">
                https://{projectId}.supabase.co/functions/v1/make-server-ca4695ac/health
              </div>
            </div>
          </div>

          <Button
            onClick={testBackend}
            disabled={testing}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white mb-6"
          >
            {testing ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              'Test Backend Connection'
            )}
          </Button>

          {results && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Test Results</h3>

              {/* Health Check Result */}
              <Card className={`p-4 ${results.healthCheck.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className="flex items-start gap-3">
                  {results.healthCheck.success ? (
                    <CheckCircle className="size-6 text-green-400 flex-shrink-0 mt-1" />
                  ) : (
                    <XCircle className="size-6 text-red-400 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-2">Health Check</h4>
                    {results.healthCheck.success ? (
                      <div className="text-green-300">
                        ✅ Backend is deployed and working!
                        <div className="mt-2 text-sm">
                          Status: {results.healthCheck.status}
                        </div>
                        <div className="mt-1 text-sm font-mono bg-slate-900/50 p-2 rounded">
                          {JSON.stringify(results.healthCheck.data, null, 2)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-red-300">
                        ❌ Backend is not responding
                        <div className="mt-2 text-sm">
                          Error: {results.healthCheck.error || 'Connection failed'}
                        </div>
                        <div className="mt-3 bg-slate-900/50 p-3 rounded text-sm">
                          <strong>Possible issues:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Edge Function not deployed yet</li>
                            <li>Function name is incorrect (should be "server")</li>
                            <li>Network/CORS issues</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {!results.healthCheck.success && (
                <Card className="bg-yellow-500/10 border-yellow-500/30 p-4">
                  <h4 className="font-semibold text-yellow-300 mb-2">🔧 How to Deploy</h4>
                  <div className="text-gray-300 text-sm space-y-2">
                    <p>If your backend is not working, deploy it using one of these methods:</p>
                    
                    <div className="bg-slate-900/50 p-3 rounded">
                      <strong className="text-white">Option 1: Supabase Dashboard (Easiest)</strong>
                      <ol className="list-decimal list-inside mt-2 space-y-1 ml-2">
                        <li>Go to your Supabase Dashboard</li>
                        <li>Click "Edge Functions" in the sidebar</li>
                        <li>Click "Create Function" → "via editor"</li>
                        <li>Name: <code className="text-cyan-400">server</code></li>
                        <li>Copy contents from <code className="text-cyan-400">/supabase/functions/server/index.tsx</code></li>
                        <li>Click "Deploy"</li>
                      </ol>
                    </div>

                    <div className="bg-slate-900/50 p-3 rounded">
                      <strong className="text-white">Option 2: CLI</strong>
                      <div className="mt-2 font-mono text-xs bg-black/30 p-2 rounded">
                        supabase functions deploy server
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              <div className="text-xs text-gray-500">
                Test performed at: {new Date(results.timestamp).toLocaleString()}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}