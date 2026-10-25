import React, { useState, useRef, useEffect } from 'react';

// Replace with your API Gateway URL
const API_ENDPOINT = 'https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/prod/scan';

// Main App
export default function App() {
    const [showSplash, setShowSplash] = useState(true);
    const [page, setPage] = useState('login');
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {/* Loading */}
            <div className={`loading-screen ${!showSplash ? 'hidden' : ''}`}>
                <div className="loading-inner">
                    <h1>Tender<span>Ready</span> AI</h1>
                    <p>Procurement Assistant</p>
                    <div className="spinner"></div>
                </div>
            </div>

            {/* Top bar */}
            <header className={`top-bar ${page === 'dashboard' ? 'hidden' : ''}`}>
                <div className="brand">TenderReady AI</div>
                <button className="login-btn" onClick={() => setPage('login')}>Login</button>
            </header>

            {/* Auth */}
            {page !== 'dashboard' && (
                <AuthScreen
                    page={page}
                    onLogin={(e) => { e.preventDefault(); setPage('dashboard'); }}
                    goToRegister={() => setPage('register')}
                    goToLogin={() => setPage('login')}
                    onClose={() => setPage('login')}
                />
            )}

            {/* Dashboard */}
            {page === 'dashboard' && (
                <DashboardScreen
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onLogout={() => { setPage('login'); setActiveTab('overview'); }}
                />
            )}
        </>
    );
}

// Login / Register
function AuthScreen({ page, onLogin, goToRegister, goToLogin, onClose }) {
    const isRegister = page === 'register';

    return (
        <div className={`auth-box open ${isRegister ? 'show-register' : ''}`}>
            <div className="close-auth" onClick={onClose}>
                <ion-icon name="close"></ion-icon>
            </div>

            {/* Login */}
            <div className="auth-panel login-panel">
                <h2>Login</h2>
                <form onSubmit={onLogin}>
                    <div className="input-field">
                        <ion-icon name="mail"></ion-icon>
                        <input type="email" required />
                        <label>Email</label>
                    </div>
                    <div className="input-field">
                        <ion-icon name="lock-closed"></ion-icon>
                        <input type="password" required />
                        <label>Password</label>
                    </div>
                    <div className="form-extras">
                        <label><input type="checkbox" /> Remember me</label>
                        <a href="#">Forgot Password?</a>
                    </div>
                    <button type="submit" className="primary-btn">Login</button>
                    <div className="switch-link">
                        Don't have an account?{' '}
                        <a href="#" onClick={(e) => { e.preventDefault(); goToRegister(); }}>Sign Up</a>
                    </div>
                </form>
            </div>

            {/* Register */}
            <div className="auth-panel register-panel">
                <h2>Sign Up</h2>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="input-field">
                        <ion-icon name="person"></ion-icon>
                        <input type="text" required />
                        <label>Username</label>
                    </div>
                    <div className="input-field">
                        <ion-icon name="mail"></ion-icon>
                        <input type="email" required />
                        <label>Email</label>
                    </div>
                    <div className="input-field">
                        <ion-icon name="lock-closed"></ion-icon>
                        <input type="password" required />
                        <label>Password</label>
                    </div>
                    <div className="form-extras">
                        <label><input type="checkbox" /> I agree to the terms</label>
                    </div>
                    <button type="submit" className="primary-btn">Sign Up</button>
                    <div className="switch-link">
                        Already have an account?{' '}
                        <a href="#" onClick={(e) => { e.preventDefault(); goToLogin(); }}>Login</a>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Dashboard
function DashboardScreen({ activeTab, setActiveTab, onLogout }) {
    return (
        <div className="dashboard open">
            <div className="dash-top">
                <div className="dash-brand">Tender<span>Ready</span></div>

                <div className="dash-tabs">
                    <button
                        className={activeTab === 'overview' ? 'active' : ''}
                        onClick={() => setActiveTab('overview')}
                    >
                        <ion-icon name="grid-outline"></ion-icon> Overview
                    </button>
                    <button
                        className={activeTab === 'company' ? 'active' : ''}
                        onClick={() => setActiveTab('company')}
                    >
                        <ion-icon name="business-outline"></ion-icon> Company
                    </button>
                    <button
                        className={activeTab === 'documents' ? 'active' : ''}
                        onClick={() => setActiveTab('documents')}
                    >
                        <ion-icon name="folder-open-outline"></ion-icon> Documents
                    </button>
                    <button
                        className={activeTab === 'tenders' ? 'active' : ''}
                        onClick={() => setActiveTab('tenders')}
                    >
                        <ion-icon name="briefcase-outline"></ion-icon> Tenders
                    </button>
                </div>

                <button className="logout-btn" onClick={onLogout}>Logout</button>
            </div>

            <div className="dash-body">
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'company' && <CompanyTab />}
                {activeTab === 'documents' && <DocumentsTab />}
                {activeTab === 'tenders' && <TendersTab />}
            </div>
        </div>
    );
}

// Overview tab
function OverviewTab() {
    const [file, setFile] = useState(null);
    const [scanState, setScanState] = useState('idle');
    const [scanError, setScanError] = useState(null);
    const fileInputRef = useRef(null);

    const [messages, setMessages] = useState([
        { sender: 'ai', text: 'Hello! Upload a tender document and I will scan it for the required items.' }
    ]);
    const [inputText, setInputText] = useState('');

    const [checklist, setChecklist] = useState([
        { id: 1, name: 'Company Registration Documents', found: false },
        { id: 2, name: 'Tax Clearance Certificate (SARS)', found: false },
        { id: 3, name: 'B-BBEE Certificate / Affidavit', found: false },
        { id: 4, name: 'Pricing Schedule (Completed)', found: false },
        { id: 5, name: 'Signed Declaration of Interest', found: false },
        { id: 6, name: 'Reference Letters (3x)', found: false }
    ]);

    const foundCount = checklist.filter(item => item.found).length;
    const totalCount = checklist.length;
    const missingCount = totalCount - foundCount;
    const completionPercent = Math.round((foundCount / totalCount) * 100);

    const pickFile = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;
        setFile(selected);
        setScanState('idle');
        setScanError(null);
        setChecklist(prev => prev.map(item => ({ ...item, found: false })));
    };

    const clearFile = (e) => {
        e.stopPropagation();
        setFile(null);
        setScanState('idle');
        setScanError(null);
        setChecklist(prev => prev.map(item => ({ ...item, found: false })));
        if (fileInputRef.current) fileInputRef.current.value = null;
    };

    const scanDocument = async () => {
        if (!file) {
            alert('Please upload a PDF first.');
            return;
        }

        setScanState('scanning');
        setScanError(null);
        setChecklist(prev => prev.map(item => ({ ...item, found: false })));

        try {
            const formData = new FormData();
            formData.append('tender', file);

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error(`Server returned ${response.status}`);

            const data = await response.json();

            if (!data.results || !Array.isArray(data.results)) {
                throw new Error('Invalid response format');
            }

            setChecklist(prev => prev.map(item => {
                const result = data.results.find(r => r.id === item.id);
                return result ? { ...item, found: result.found } : item;
            }));

            setScanState('complete');

            const found = data.results.filter(r => r.found).length;
            setMessages(prev => [...prev, {
                sender: 'ai',
                text: `Scan complete. I found ${found} of ${data.results.length} required documents.`
            }]);

        } catch (err) {
            console.error('Scan failed:', err);
            setScanError('Could not reach the scanning service. Check your connection and try again.');
            setScanState('idle');
        }
    };

    const toggleItem = (id) => {
        setChecklist(prev => prev.map(item =>
            item.id === id ? { ...item, found: !item.found } : item
        ));
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        setMessages(prev => [...prev, { sender: 'user', text: inputText }]);
        const question = inputText.toLowerCase();
        setInputText('');

        setTimeout(() => {
            let reply = 'Based on the document, ';
            if (question.includes('missing')) {
                reply += scanState === 'complete'
                    ? `you are missing ${missingCount} document(s).`
                    : 'please scan a document first.';
            } else if (question.includes('date')) {
                reply += 'the closing date is 31 November 2024 at 11:00 AM.';
            } else {
                reply += 'please upload and scan a document first.';
            }
            setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
        }, 800);
    };

    return (
        <>
            <div className="metrics">
                <MetricCard icon="documents-outline" color="blue" value="12" label="Tenders Submitted" />
                <MetricCard icon="trophy-outline" color="green" value="4" label="Tenders Awarded" />
                <MetricCard icon="shield-checkmark-outline" color="orange" value="Level 1" label="B-BBEE Status" />
                <MetricCard icon="alert-circle-outline" color="red" value={scanState === 'complete' ? missingCount : '—'} label="Missing Documents" />
            </div>

            {scanError && (
                <div className="error-banner">
                    <ion-icon name="alert-circle"></ion-icon> {scanError}
                </div>
            )}

            <div className="card">
                <div className="card-title">
                    <ion-icon name="cloud-upload-outline"></ion-icon> Upload Tender Document
                </div>

                <div className="upload-area" onClick={() => fileInputRef.current.click()}>
                    {file ? (
                        <>
                            <ion-icon name="document-text" style={{ fontSize: '3em', color: '#4caf50' }}></ion-icon>
                            <p style={{ color: '#4caf50', fontWeight: 'bold' }}>File Selected</p>
                            <button className="remove-file" onClick={clearFile}>
                                <ion-icon name="close"></ion-icon>
                            </button>
                        </>
                    ) : (
                        <>
                            <ion-icon name="cloud-upload-outline"></ion-icon>
                            <p>Click to browse and upload your Tender/RFQ PDF</p>
                            <p className="hint">Supported format: PDF (Max 10MB)</p>
                        </>
                    )}
                    <input type="file" ref={fileInputRef} hidden accept=".pdf" onChange={pickFile} />
                </div>

                <div style={{ marginTop: '15px', textAlign: 'right' }}>
                    <button
                        className="primary-btn"
                        style={{ width: 'auto', padding: '0 25px' }}
                        onClick={scanDocument}
                        disabled={!file || scanState === 'scanning'}
                    >
                        {scanState === 'scanning' ? 'Scanning...' : scanState === 'complete' ? 'Re-scan Document' : 'Scan Document'}
                    </button>
                </div>
            </div>

            {scanState === 'scanning' && (
                <div className="card">
                    <div className="card-title">
                        <ion-icon name="checkbox-outline"></ion-icon> Analyzing Document
                    </div>
                    <div className="scanning-box">
                        <div className="small-spinner"></div>
                        <p>Scanning tender document for required items</p>
                        <p className="sub-text">This may take a few moments</p>
                    </div>
                </div>
            )}

            {scanState === 'complete' && (
                <div className="card">
                    <div className="card-title">
                        <ion-icon name="checkbox-outline"></ion-icon> Requirements Checklist
                        <span className={`badge ${missingCount > 0 ? 'pending' : 'verified'}`} style={{ marginLeft: 'auto' }}>
                            {missingCount > 0 ? `${missingCount} Missing` : 'All Found'}
                        </span>
                    </div>

                    <div className="checklist-progress">
                        <span>Compliance Score</span>
                        <span><strong>{completionPercent}%</strong> ({foundCount}/{totalCount})</span>
                    </div>

                    <ul className="checklist-items">
                        {checklist.map(item => (
                            <li key={item.id}>
                                <input type="checkbox" checked={item.found} onChange={() => toggleItem(item.id)} />
                                <span className={`item-name ${item.found ? 'done' : ''}`}>{item.name}</span>
                                <span className={`status-pill ${item.found ? 'found' : 'missing'}`}>
                                    {item.found ? 'Found' : 'Missing'}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {scanState === 'idle' && (
                <div className="card">
                    <div className="card-title">
                        <ion-icon name="checkbox-outline"></ion-icon> Requirements Checklist
                    </div>
                    <div className="empty-state">
                        <ion-icon name="document-outline"></ion-icon>
                        <p>Upload a tender document and click <strong>Scan Document</strong> to see which requirements are met.</p>
                    </div>
                </div>
            )}

            {scanState === 'complete' && (
                <div className="card">
                    <div className="card-title">
                        <ion-icon name="document-text-outline"></ion-icon> Tender Summary
                    </div>
                    <SummaryLine label="Tender Title" value="Supply of IT Equipment" />
                    <SummaryLine label="Reference" value="RFQ-2024-001" />
                    <SummaryLine label="Closing Date" value="31 Nov 2024" />
                    <SummaryLine label="Readiness Score" value={`${completionPercent}%`} color={completionPercent >= 80 ? '#4caf50' : '#ff9800'} />
                </div>
            )}

            <div className="card">
                <div className="card-title">
                    <ion-icon name="chatbubbles-outline"></ion-icon> Ask TenderReady
                </div>
                <div className="chat-box">
                    <div className="chat-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`message ${msg.sender}`}>{msg.text}</div>
                        ))}
                    </div>
                    <form className="chat-input" onSubmit={sendMessage}>
                        <input
                            type="text"
                            placeholder="Ask a question..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                        <button type="submit"><ion-icon name="send"></ion-icon></button>
                    </form>
                </div>
            </div>
        </>
    );
}

// Company tab
function CompanyTab() {
    return (
        <div className="card">
            <div className="profile-header">
                <div>
                    <h2>TechSolutions Ltd.</h2>
                    <p>Registration: 2020/123456/07</p>
                </div>
                <span className="badge verified">Verified</span>
            </div>

            <div className="profile-grid">
                <ProfileField label="VAT Number" value="4123456789" />
                <ProfileField label="Tax Compliance" value="Compliant" color="#4caf50" />
                <ProfileField label="B-BBEE Level" value="Level 1 Contributor" />
                <ProfileField label="CSD Number" value="MAAA0123456" />
                <ProfileField label="Address" value="123 Main Rd, Sandton, JHB" />
                <ProfileField label="Contact" value="John Doe (Director)" />
            </div>
        </div>
    );
}

// Documents tab
function DocumentsTab() {
    const docs = [
        { name: 'B-BBEE Certificate', status: 'verified', date: 'Expires: 31 Dec 2024' },
        { name: 'Tax Clearance Certificate', status: 'verified', date: 'Expires: 15 Nov 2024' },
        { name: 'Company Registration (CIPC)', status: 'verified', date: 'Valid' },
        { name: 'Public Liability Insurance', status: 'pending', date: 'Pending Upload' },
        { name: 'Reference Letters', status: 'missing', date: 'Action Required' }
    ];

    return (
        <div className="doc-list">
            {docs.map((doc, i) => (
                <div className="doc-item" key={i}>
                    <div className="doc-info">
                        <ion-icon name="document-text"></ion-icon>
                        <div>
                            <h4>{doc.name}</h4>
                            <p>{doc.date}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span className={`badge ${doc.status}`}>
                            {doc.status === 'verified' ? 'Verified' : doc.status === 'pending' ? 'Pending' : 'Missing'}
                        </span>
                        <button className="upload-doc-btn">Upload</button>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Tenders tab
function TendersTab() {
    const tenders = [
        { ref: 'RFQ-2024-001', desc: 'Supply of IT Equipment', date: '31 Nov 2024', status: 'pending' },
        { ref: 'RFQ-2024-002', desc: 'Office Furniture', date: '15 Oct 2024', status: 'verified' },
        { ref: 'RFQ-2023-099', desc: 'Cleaning Services', date: '01 Sep 2023', status: 'missing' }
    ];

    return (
        <table className="tenders-table">
            <thead>
                <tr>
                    <th>Reference</th>
                    <th>Description</th>
                    <th>Closing Date</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {tenders.map((tender, i) => (
                    <tr key={i}>
                        <td>{tender.ref}</td>
                        <td>{tender.desc}</td>
                        <td>{tender.date}</td>
                        <td>
                            <span className={`badge ${tender.status}`}>
                                {tender.status === 'verified' ? 'Awarded' : tender.status === 'pending' ? 'In Progress' : 'Lost'}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

// Small helpers
function MetricCard({ icon, color, value, label }) {
    return (
        <div className="metric-card">
            <div className={`metric-icon ${color}`}>
                <ion-icon name={icon}></ion-icon>
            </div>
            <div>
                <h3>{value}</h3>
                <p>{label}</p>
            </div>
        </div>
    );
}

function SummaryLine({ label, value, color }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
            <span style={{ color: '#666' }}>{label}:</span>
            <span style={{ fontWeight: 600, color: color || '#162938' }}>{value}</span>
        </div>
    );
}

function ProfileField({ label, value, color }) {
    return (
        <div className="profile-item">
            <label>{label}</label>
            <span style={{ color: color || '#162938' }}>{value}</span>
        </div>
    );
}