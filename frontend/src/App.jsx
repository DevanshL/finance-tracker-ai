import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Test API connection
    const testAPI = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL.replace('/api', '') + '/api/test')
        const data = await response.json()
        setApiStatus(data)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    testAPI()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-900 mb-2">
            💰 Finance Tracker
          </h1>
          <p className="text-gray-600">with AI Coach - Local Development Environment</p>
        </div>

        <div className="space-y-6">
          {/* Environment Status */}
          <div className="card-bordered p-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>🌍</span> Environment Status
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Frontend:</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge badge-success">Running</span>
                  <span className="text-sm">Port 5173</span>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Backend:</span>
                <div className="flex items-center gap-2 mt-1">
                  {loading ? (
                    <span className="badge badge-warning">Checking...</span>
                  ) : error ? (
                    <span className="badge badge-danger">Offline</span>
                  ) : (
                    <span className="badge badge-success">Running</span>
                  )}
                  <span className="text-sm">Port 5000</span>
                </div>
              </div>
            </div>
          </div>

          {/* API Connection Status */}
          {loading ? (
            <div className="text-center py-8">
              <div className="spinner spinner-lg mx-auto mb-4"></div>
              <p className="text-gray-600">Testing API connection...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              <div className="font-semibold mb-1">❌ Cannot connect to backend</div>
              <div className="text-sm">Error: {error}</div>
              <div className="text-sm mt-2">
                Make sure the backend server is running on http://localhost:5000
              </div>
            </div>
          ) : (
            <div className="alert alert-success">
              <div className="font-semibold mb-2">✅ Backend Connected Successfully!</div>
              <div className="text-sm">{apiStatus?.message}</div>
            </div>
          )}

          {/* Dependencies Status */}
          {apiStatus && (
            <div className="card-bordered p-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>📦</span> Local Dependencies
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(apiStatus.localDependencies || {}).map(([dep, status]) => (
                  <div key={dep} className="flex items-center gap-2">
                    <span>{status ? '✅' : '❌'}</span>
                    <span className="text-sm">{dep}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Environment Variables */}
          {apiStatus && (
            <div className="card-bordered p-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>🔐</span> Environment Configuration
              </h2>
              <div className="space-y-2">
                {Object.entries(apiStatus.environment || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{key}:</span>
                    <span className={value ? 'text-success-600 font-medium' : 'text-danger-600'}>
                      {typeof value === 'boolean' ? (value ? '✅ Set' : '❌ Missing') : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="card-bordered p-4 bg-primary-50">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>🚀</span> Next Steps
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Setup MongoDB Atlas account and get connection string</li>
              <li>Get Google Gemini API key</li>
              <li>Update backend/.env with real credentials</li>
              <li>Start building authentication system</li>
              <li>Create transaction management features</li>
            </ol>
          </div>

          {/* Links */}
          <div className="flex justify-center gap-4 pt-4">
            <a 
              href="http://localhost:5000/api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
            >
              📡 View API
            </a>
            <a 
              href="http://localhost:5000/health" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
            >
              💚 Health Check
            </a>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          All dependencies installed locally in this project 📂
        </div>
      </div>
    </div>
  )
}

export default App;