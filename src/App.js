
import React, { useState, useRef, useEffect } from 'react';

// Replace with your real AWS API Gateway URL.
const API_ENDPOINT =
    'https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/prod/scan';

const INITIAL_CHECKLIST = [
    { id: 1, name: 'Company Registration Documents', found: false },
    { id: 2, name: 'Tax Clearance Certificate (SARS)', found: false },
    { id: 3, name: 'B-BBEE Certificate / Affidavit', found: false },
    { id: 4, name: 'Pricing Schedule (Completed)', found: false },
    { id: 5, name: 'Signed Declaration of Interest', found: false },
    { id: 6, name: 'Reference Letters (3x)', found: false }
];

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
            <div className={`loading-screen ${!showSplash ? 'hidden' : ''}`}>
                <div className="loading-inner">
                    <h1>Tender<span>Ready</span> AI</h1>
                    <p>Procurement Assistant</p>
                    <div className="spinner"></div>
                </div>
            </div>

            <header className={`top-bar ${page === 'dashboard' ? 'hidden' : ''}`}>
                <div className="brand">TenderReady AI</div>
                <button className="login-btn" onClick={() => setPage('login')}>
                    Login
                </button>
            </header>

            {page !== 'dashboard' && (
                <AuthScreen
                    page={page}
                    onLogin={(e) => {
                        e.preventDefault();
                        setPage('dashboard');
                    }}
                    goToRegister={() => setPage('register')}
                    goToLogin={() => setPage('login')}
                    onClose={() => setPage('login')}
                />
            )}

            {page === 'dashboard' && (
                <DashboardScreen
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onLogout={() => {
                        setPage('login');
                        setActiveTab('overview');
                    }}
                />
            )}
        </>
    );
}

// LOGIN AND REGISTER
function AuthScreen({ page, onLogin, goToRegister, goToLogin, onClose }) {
    const isRegister = page === 'register';

    return (
        <div className={`auth-box open ${isRegister ? 'show-register' : ''}`}>
            <div className="close-auth" onClick={onClose}>
                <ion-icon name="close"></ion-icon>
            </div>

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
                        <a href="#" onClick={(e) => e.preventDefault()}>
                            Forgot Password?
                        </a>
                    </div>
                    <button type="submit" className="primary-btn">Login</button>
                    <div className="switch-link">
                        Don't have an account?{' '}
                        <a href="#" onClick={(e) => {
                            e.preventDefault();
                            goToRegister();
                        }}>Sign Up</a>
                    </div>
                </form>
            </div>

            <div className="auth-panel register-panel">
                <h2>Sign Up</h2>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    alert('Registration requires an authentication backend.');
                }}>
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
                        <label><input type="checkbox" required /> I agree to the terms</label>
                    </div>
                    <button type="submit" className="primary-btn">Sign Up</button>
                    <div className="switch-link">
                        Already have an account?{' '}
                        <a href="#" onClick={(e) => {
                            e.preventDefault();
                            goToLogin();
                        }}>Login</a>
                    </div>
                </form>
            </div>
        </div>
    );
}

// DASHBOARD
function DashboardScreen({ activeTab, setActiveTab, onLogout }) {
    return (
        <div className="dashboard open">
            <div className="dash-top">
                <div className="dash-brand">Tender<span>Ready</span></div>

                <div className="dash-tabs">
                    <button className={activeTab === 'overview' ? 'active' : ''}
                        onClick={() => setActiveTab('overview')}>
                        <ion-icon name="grid-outline"></ion-icon> Overview
                    </button>
                    <button className={activeTab === 'company' ? 'active' : ''}
                        onClick={() => setActiveTab('company')}>
                        <ion-icon name="business-outline"></ion-icon> Company
                    </button>
                    <button className={activeTab === 'documents' ? 'active' : ''}
                        onClick={() => setActiveTab('documents')}>
                        <ion-icon name="folder-open-outline"></ion-icon> Documents
                    </button>
                    <button className={activeTab === 'tenders' ? 'active' : ''}
                        onClick={() => setActiveTab('tenders')}>
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

// DOCUMENT SCANNER AND OVERVIEW
function OverviewTab() {
    const [file, setFile] = useState(null);
    const [scanState, setScanState] = useState('idle');
    const [scanError, setScanError] = useState(null);
    const [summary, setSummary] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    const fileInputRef = useRef(null);

    const [messages, setMessages] = useState([
        {
            sender: 'ai',
            text: 'Hello! Upload a tender document and I will scan it for the required items.'
        }
    ]);
    const [inputText, setInputText] = useState('');

    const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);

    const foundCount = checklist.filter(item => item.found).length;
    const totalCount = checklist.length;
    const missingCount = totalCount - foundCount;
    const completionPercent = Math.round((foundCount / totalCount) * 100);

    const pickFile = (e) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        if (selected.type !== 'application/pdf' &&
            !selected.name.toLowerCase().endsWith('.pdf')) {
            setScanError('Please select a PDF document.');
            e.target.value = '';
            return;
        }

        if (selected.size > 10 * 1024 * 1024) {
            setScanError('The PDF must not exceed 10MB.');
            e.target.value = '';
            return;
        }

        setFile(selected);
        setScanState('idle');
        setScanError(null);
        setSummary(null);
        setExtractedText('');
        setChecklist(INITIAL_CHECKLIST);
    };

    const clearFile = (e) => {
        e.stopPropagation();
        setFile(null);
        setScanState('idle');
        setScanError(null);
        setSummary(null);
        setExtractedText('');
        setChecklist(INITIAL_CHECKLIST);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Send the actual PDF to AWS API Gateway.
    const scanDocument = async () => {
        if (!file) {
            setScanError('Please upload a PDF first.');
            return;
        }

        if (API_ENDPOINT.includes('YOUR_API_ID')) {
            setScanError('Configure your real AWS API Gateway URL first.');
            return;
        }

        setScanState('scanning');
        setScanError(null);
        setSummary(null);
        setExtractedText('');
        setChecklist(INITIAL_CHECKLIST);

        try {
            const formData = new FormData();
            formData.append('tender', file);

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                body: formData
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message || data.error ||
                    `AWS returned HTTP ${response.status}`
                );
            }

            if (!Array.isArray(data.results)) {
                throw new Error(
                    'Unexpected AWS response. Expected a results array.'
                );
            }

            setChecklist(prev => prev.map(item => {
                const result = data.results.find(
                    r => Number(r.id) === item.id
                );

                return result
                    ? { ...item, found: result.found === true }
                    : item;
            }));

            setSummary(data.summary || null);
            setExtractedText(
                typeof data.extractedText === 'string'
                    ? data.extractedText
                    : ''
            );

            setScanState('complete');

            const found = data.results.filter(
                r => r.found === true
            ).length;

            setMessages(prev => [
                ...prev,
                {
                    sender: 'ai',
                    text: `Scan complete. ${found} of ${data.results.length} requirements were identified as found.`
                }
            ]);
        } catch (error) {
            console.error('Document scan failed:', error);
            setScanError(
                error.message ||
                'Could not reach the scanning service. Please try again.'
            );
            setScanState('idle');
        }
    };

    const toggleItem = (id) => {
        setChecklist(prev => prev.map(item =>
            item.id === id ? { ...item, found: !item.found } : item
        ));
    };

    // Answers basic questions using the returned document data.
    const sendMessage = (e) => {
        e.preventDefault();

        const question = inputText.trim();
        if (!question) return;

        setMessages(prev => [
            ...prev,
            { sender: 'user', text: question }
        ]);
        setInputText('');

        let reply;

        if (scanState !== 'complete') {
            reply = 'Please upload and scan a tender document first.';
        } else if (/closing date|deadline|due date/i.test(question)) {
            reply = summary?.closingDate
                ? `The closing date extracted from the document is ${summary.closingDate}.`
                : 'No closing date was identified in the returned summary.';
        } else if (/reference|rfq number|tender number/i.test(question)) {
            reply = summary?.reference
                ? `The tender reference is ${summary.reference}.`
                : 'No tender reference was identified.';
        } else if (/title|name of tender/i.test(question)) {
            reply = summary?.title
                ? `The tender title is ${summary.title}.`
                : 'No tender title was identified.';
        } else if (/missing|required documents/i.test(question)) {
            const missing = checklist.filter(item => !item.found);
            reply = missing.length
                ? `Requirements currently marked as missing: ${missing.map(item => item.name).join(', ')}.`
                : 'All checklist items are currently marked as found.';
        } else if (extractedText) {
            const terms = question.toLowerCase().split(/\s+/)
                .filter(word => word.length > 3);
            const relevantLines = extractedText.split(/\n/)
                .filter(line => terms.some(term =>
                    line.toLowerCase().includes(term)
                ))
                .slice(0, 5);

            reply = relevantLines.length
                ? `Relevant text from the scanned document:\n${relevantLines.join('\n')}`
                : 'I could not find a matching passage in the extracted text. A document-aware AI backend is needed to answer more complex questions.';
        } else {
            reply = 'The scan completed, but AWS did not return extracted text for searching.';
        }

        setMessages(prev => [
            ...prev,
            { sender: 'ai', text: reply }
        ]);
    };

    return (
        <>
            <div className="metrics">
                <MetricCard icon="documents-outline" color="blue"
                    value={summary?.tendersSubmitted ?? '—'}
                    label="Tenders Submitted" />
                <MetricCard icon="trophy-outline" color="green"
                    value={summary?.tendersAwarded ?? '—'}
                    label="Tenders Awarded" />
                <MetricCard icon="shield-checkmark-outline" color="orange"
                    value={summary?.bbbeeStatus || '—'}
                    label="B-BBEE Status" />
                <MetricCard icon="alert-circle-outline" color="red"
                    value={scanState === 'complete' ? missingCount : '—'}
                    label="Missing Documents" />
            </div>

            {scanError && (
                <div className="error-banner">
                    <ion-icon name="alert-circle"></ion-icon> {scanError}
                </div>
            )}

            <div className="card">
                <div className="card-title">
                    <ion-icon name="cloud-upload-outline"></ion-icon>
                    Upload Tender Document
                </div>

                <div className="upload-area"
                    onClick={() => fileInputRef.current?.click()}>
                    {file ? (
                        <>
                            <ion-icon name="document-text"
                                style={{ fontSize: '3em', color: '#4caf50' }}>
                            </ion-icon>
                            <p style={{ color: '#4caf50', fontWeight: 'bold' }}>
                                {file.name}
                            </p>
                            <p className="hint">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                            <button type="button" className="remove-file"
                                onClick={clearFile}>
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

                    <input
                        type="file"
                        ref={fileInputRef}
                        hidden
                        accept=".pdf,application/pdf"
                        onChange={pickFile}
                    />
                </div>

                <div style={{ marginTop: '15px', textAlign: 'right' }}>
                    <button className="primary-btn"
                        style={{ width: 'auto', padding: '0 25px' }}
                        onClick={scanDocument}
                        disabled={!file || scanState === 'scanning'}>
                        {scanState === 'scanning'
                            ? 'Scanning...'
                            : scanState === 'complete'
                                ? 'Re-scan Document'
                                : 'Scan Document'}
                    </button>
                </div>
            </div>

            {scanState === 'scanning' && (
                <div className="card">
                    <div className="card-title">
                        <ion-icon name="checkbox-outline"></ion-icon>
                        Analyzing Document
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
                        <ion-icon name="checkbox-outline"></ion-icon>
                        Requirements Checklist
                        <span className={`badge ${missingCount > 0 ? 'pending' : 'verified'}`}
                            style={{ marginLeft: 'auto' }}>
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
                                <input type="checkbox"
                                    checked={item.found}
                                    onChange={() => toggleItem(item.id)} />
                                <span className={`item-name ${item.found ? 'done' : ''}`}>
                                    {item.name}
                                </span>
                                <span className={`status-pill ${item.found ? 'found' : 'missing'}`}>
                                    {item.found ? 'Found' : 'Missing'}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <p className="hint">
                        Checklist results are based on the AWS response. Verify
                        requirements before submitting a tender. You can manually toggle items if needed.
                    </p>
                </div>
            )}

            {scanState === 'idle' && (
                <div className="card">
                    <div className="card-title">
                        <ion-icon name="checkbox-outline"></ion-icon>
                        Requirements Checklist
                    </div>
                    <div className="empty-state">
                        <ion-icon name="document-outline"></ion-icon>
                        <p>
                            Upload a tender document and click
                            <strong> Scan Document </strong>
                            to see which requirements are met.
                        </p>
                    </div>
                </div>
            )}

            {scanState === 'complete' && (
                <div className="card">
                    <div className="card-title">
                        <ion-icon name="document-text-outline"></ion-icon>
                        Tender Summary
                    </div>

                    <SummaryLine label="Tender Title"
                        value={summary?.title || 'Not identified in document'} />
                    <SummaryLine label="Reference"
                        value={summary?.reference || 'Not identified in document'} />
                    <SummaryLine label="Closing Date"
                        value={summary?.closingDate || 'Not identified in document'} />
                    <SummaryLine label="Readiness Score"
                        value={`${completionPercent}%`}
                        color={completionPercent >= 80 ? '#4caf50' : '#ff9800'} />
                </div>
            )}

            <div className="card">
                <div className="card-title">
                    <ion-icon name="chatbubbles-outline"></ion-icon>
                    Ask TenderReady
                </div>

                <div className="chat-box">
                    <div className="chat-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`message ${msg.sender}`}
                                style={{ whiteSpace: 'pre-wrap' }}>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <form className="chat-input" onSubmit={sendMessage}>
                        <input type="text"
                            placeholder="Ask a question..."
                            value={inputText}
                            onChange={e => setInputText(e.target.value)} />
                        <button type="submit">
                            <ion-icon name="send"></ion-icon>
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

// COMPANY
function CompanyTab() {
    return (
        <div className="card">
            <div className="profile-header">
                <div>
                    <h2>Company Profile</h2>
                    <p>Connect your company records to display verified details.</p>
                </div>
                <span className="badge pending">Not Connected</span>
            </div>
            <div className="empty-state">
                <ion-icon name="business-outline"></ion-icon>
                <p>
                    Company information will appear here when a company profile
                    API or saved company record is connected.
                </p>
            </div>
        </div>
    );
}

// DOCUMENTS
function DocumentsTab() {
    return (
        <div className="card">
            <div className="card-title">
                <ion-icon name="folder-open-outline"></ion-icon>
                Documents
            </div>
            <div className="empty-state">
                <ion-icon name="document-outline"></ion-icon>
                <p>
                    Uploaded and verified company documents will appear here
                    once a document storage and listing API is connected.
                </p>
            </div>
        </div>
    );
}

// TENDERS
function TendersTab() {
    return (
        <div className="card">
            <div className="card-title">
                <ion-icon name="briefcase-outline"></ion-icon>
                Tenders
            </div>
            <div className="empty-state">
                <ion-icon name="document-text-outline"></ion-icon>
                <p>
                    Saved tender records will appear here when a tender database
                    or listing endpoint is connected.
                </p>
            </div>
        </div>
    );
}

// REUSABLE COMPONENTS
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
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '16px',
            padding: '8px 0',
            borderBottom: '1px solid #f0f0f0'
        }}>
            <span style={{ color: '#666' }}>{label}:</span>
            <span style={{
                fontWeight: 600,
                color: color || '#162938',
                textAlign: 'right',
                overflowWrap: 'anywhere'
            }}>{value}</span>
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
