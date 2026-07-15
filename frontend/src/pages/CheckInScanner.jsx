import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import client from '../api/client';

export default function CheckInScanner() {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [manualPayload, setManualPayload] = useState('');
  const [manualMode, setManualMode] = useState(false);

  const submitScan = async (rawPayload) => {
    try {
      const parsed = JSON.parse(rawPayload);
      const { data } = await client.post('/checkin/scan', {
        bookingId: parsed.b,
        payload: rawPayload,
      });
      setResult({ valid: true, ...data });
    } catch (err) {
      setResult({
        valid: false,
        reason: err.response?.data?.reason || err.response?.data?.message || 'Invalid QR code',
      });
    }
  };

  useEffect(() => {
    if (!scanning) return;
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          submitScan(decodedText);
          scanner.stop().catch(() => {});
          setScanning(false);
        },
        () => {}
      )
      .catch((err) => setResult({ valid: false, reason: `Camera error: ${err}` }));

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [scanning]);

  const resetScanner = () => {
    setResult(null);
    setManualPayload('');
    setManualMode(false);
  };

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <p className="eyebrow">Venue entry</p>
      <h1>QR Check-in</h1>
      <p style={{ marginBottom: 24, color: 'var(--color-ink-soft)' }}>
        Scan attendee QR codes to validate tickets and check them in at the venue entrance.
      </p>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Camera Scanner */}
        {!manualMode && (
          <div>
            {!scanning ? (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>📷</div>
                <p style={{ fontSize: '0.9rem', marginBottom: 20 }}>
                  Position the QR code inside the frame to scan
                </p>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => { setResult(null); setScanning(true); }}
                >
                  Start camera scan
                </button>
              </div>
            ) : (
              <div className="scanner-container">
                <div id="qr-reader" />
                <div className="scanner-frame" />
                <button
                  className="btn btn-ghost"
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    backdropFilter: 'blur(8px)',
                    zIndex: 10,
                  }}
                  onClick={() => {
                    scannerRef.current?.stop().catch(() => {});
                    setScanning(false);
                  }}
                >
                  ⏹ Stop scanning
                </button>
              </div>
            )}
          </div>
        )}

        {/* Manual mode toggle */}
        <div style={{
          borderTop: '1px solid var(--color-border)',
          padding: 20,
        }}>
          <button
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', justifyContent: 'flex-start' }}
            onClick={() => setManualMode(!manualMode)}
          >
            {manualMode ? '📷 Switch to camera scan' : '⌨️ Or paste QR payload manually'}
          </button>

          {manualMode && (
            <div style={{ marginTop: 12, animation: 'fadeIn 0.3s ease-out' }}>
              <textarea
                className="input"
                rows={2}
                placeholder='Paste the QR payload JSON here…'
                value={manualPayload}
                onChange={(e) => setManualPayload(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
              />
              <button
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: 8 }}
                disabled={!manualPayload.trim()}
                onClick={() => submitScan(manualPayload)}
              >
                Verify ticket
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div style={{ marginTop: 20, animation: 'scaleIn 0.3s ease-out' }}>
          <div className={`scan-result ${result.valid ? 'valid' : 'invalid'}`}>
            {result.valid ? (
              <>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: '1rem', marginBottom: 4 }}>
                  Valid ticket — {result.tierName} × {result.quantity}
                </div>
                {result.checkedInAt && (
                  <div style={{ fontSize: '0.82rem', opacity: 0.8 }}>
                    Checked in at {new Date(result.checkedInAt).toLocaleTimeString()}
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>❌</div>
                <div>{result.reason}</div>
              </>
            )}
          </div>
          <button
            className="btn btn-outline"
            style={{ width: '100%', marginTop: 12 }}
            onClick={resetScanner}
          >
            Scan another ticket
          </button>
        </div>
      )}
    </div>
  );
}
