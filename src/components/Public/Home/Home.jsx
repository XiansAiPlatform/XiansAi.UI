import React, { useState } from 'react';
import '../Public.css';
import { FiCpu, FiLock, FiSettings, FiStar, FiGitBranch } from 'react-icons/fi';
import { BiLogoGithub, BiGitRepoForked, BiCodeAlt } from 'react-icons/bi';
import { RiRobot2Fill, RiFlowChart, RiRocketLine, RiExchangeLine, RiOpenSourceFill } from 'react-icons/ri';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAuth0 } from '@auth0/auth0-react';

export default function Home() {
    const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
    const [activeTab, setActiveTab] = useState(0);
    const [activeCodeTab, setActiveCodeTab] = useState('flow');
    const [activeFeatureTab, setActiveFeatureTab] = useState(0);

    const featureTabs = [
        {
            title: "Agent Visualization",
            description: "Design and monitor complex AI workflows with intuitive visualization tools. Track agent interactions and data flows in real-time for complete operational visibility.",
            image: "/images/visualizer.png",
            icon: <RiFlowChart className="home-tab-icon" />
        },
        {
            title: "Execution Monitoring",
            description: "Monitor AI workflows in real-time with comprehensive execution details. Get instant insights into agent performance, task status, and system health from a unified dashboard.",
            image: "/images/monitoring.png",
            icon: <FiCpu className="home-tab-icon" />
        },
        {
            title: "Agent Training",
            description: "Optimize AI agents for specific business tasks through our specialized training interface. Enhance performance through iterative learning and structured feedback loops.",
            image: "/images/training.png",
            icon: <RiRobot2Fill className="home-tab-icon" />
        }
    ];

    const codeExamples = {
        flow: {
            file: 'BloggerFlow.cs',
            code: `
[Workflow]
public class BloggingFlow: FlowBase
{
    [WorkflowRun]
    public async Task<string[]> Run(string input)
    {
        // Run the research agent to find relevant topics
        var topics = await RunActivityAsync( (ResearchAgent a) => a.FindRelevantTopics());

        var newBlogPosts = new List<string>();

        foreach (var topic in topics)
        {
            // Run the writer agent to write and publish the blog posts
            var url = await RunActivityAsync( (WriterAgent a) => a.WriteAndPublishBlog(topic));
            newBlogPosts.Add(url.ToString());
        }

        // return the result
        return newBlogPosts.ToArray();
    }
}`
        },
        agentOne: {
            file: 'ResearchActivity.cs',
            code: `[Agents("xiansai-agent/web-research")]
[Instructions("Competitor-Urls", "How-To-Research-Blog-Topics")]
public class ResearchActivity : ActivityStub,  IResearchActivity
{
    [Activity]
    public async Task<string[]> FindRelevantTopics()
    {
        // Load instructions
        var competitorUrls = await LoadInstruction(1);
        var corporateOverview = await LoadInstruction(2);

        // Run the agent
        var agent = GetAgent();
        agent.SetEnv("COMPETITOR_URLS", competitorUrls);
        agent.SetEnv("CORPORATE_OVERVIEW", corporateOverview);
        var result = await agent.DockerRun();

        // Return the result
        return result.Output!.Split("\\n");
    }
}`
        },
        agentTwo: {
            file: 'WriterActivity.cs',
            code: `[Agents("xiansai-agent/blog-publisher")]
[Instructions("How-To-Write-Blogs")]
public class WriterActivity : ActivityStub, IWriterActivity
{
    [Activity]
    public async Task<Uri> WriteAndPublishBlog(string topic)
    {
        // Load instructions
        var instructions = await LoadInstruction();

        // Run the agent
        var agent = GetAgent();
        agent.SetEnv("TOPIC", topic);
        agent.SetEnv("INSTRUCTIONS", instructions);
        var result = await agent.DockerRun();

        // Return the result
        return new Uri(result.Output!);
    }
}`
        }
    };

    const featureCodeExamples = [
        `
await Workflow.DelayAsync(TimeSpan.FromDays(365));
// Your workflow continues exactly where it left off after a year`,
        
    `[WorkflowSignal]
public async Task UserApproved(string comment)
{
    approval = true;
    // User responded to the question posted on chat
    // Lets continue the execution
}

// Workflow waits for user to approve
await Workflow.WaitConditionAsync(() => approval);`
,
        
        `
// Run the flow executers on any number of machines/containers
await flowRunner.RunFlowAsync(flowInfo);`,
        
        `// Fault Tolerant Through Retry Policy
RetryPolicy = new() { MaximumInterval = TimeSpan.FromSeconds(60) },`,
        
        `// Simply use a variables to store the workflow state
var newBlogPosts = new List<string>();`
    ];

    const handleTabClick = (index) => {
        setActiveFeatureTab(index);
    };

    return (
        <div className="home-container">
            {/* GitHub Corner */}
            <a href="https://github.com/XiansAiPlatform" className="github-corner" aria-label="View on GitHub">
                <svg width="80" height="80" viewBox="0 0 250 250" aria-hidden="true">
                    <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
                    <path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" className="octo-arm"></path>
                    <path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" className="octo-body"></path>
                </svg>
            </a>

            <header className="home-header">
                <div className="home-header-content">
                    <div className="home-logo-container">
                        <div className="home-logo">
                            <span className="home-logo-flow">Xians</span>
                            <span className="home-logo-ai">.ai</span>
                        </div>
                        <a href="https://99x.io" target="_blank" rel="noopener noreferrer" className="home-logo-sub">
                            <span className="home-logo-by">by</span>
                            <img src="/images/99xlogo.svg" alt="99x" className="home-logo-99x" />
                        </a>
                    </div>
                    <div className="home-nav-auth">
                        <nav className="home-nav">
                            <a href="https://xiansaiplatform.github.io/XiansAi.PublicDocs/" target="_blank" rel="noopener noreferrer" className="home-nav-link">
                                Documentation
                            </a>
                        </nav>
                        <div className="home-auth-buttons">
                            {isAuthenticated ? (
                                <>
                                    <button 
                                        className="home-btn home-btn-primary" 
                                        onClick={() => window.location.href = '/runs'}
                                    >
                                        Enter Application
                                    </button>
                                    <button 
                                        className="home-btn home-btn-secondary" 
                                        onClick={() => logout({ returnTo: window.location.origin })}
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        className="home-btn home-btn-secondary" 
                                        onClick={() => loginWithRedirect()}
                                    >
                                        Login
                                    </button>
                                    <button 
                                        className="home-btn home-btn-primary" 
                                        onClick={() => loginWithRedirect()}
                                    >
                                        <BiLogoGithub />
                                        Sign up with GitHub
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <section className="home-hero">
                <div className="home-hero-content">
                    <div className="hero-badges">
                        <a 
                            href="https://github.com/XiansAiPlatform" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="open-source-badge"
                        >
                            <RiOpenSourceFill />
                            Open Source
                        </a>
                        <a 
                            href="https://github.com/XiansAiPlatform" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="github-counter"
                        >
                            <FiStar />
                            <span>Star</span>
                        </a>
                        <a 
                            href="https://github.com/XiansAiPlatform" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="github-counter"
                        >
                            <FiGitBranch />
                            <span>Fork</span>
                        </a>
                    </div>
                    
                    <h1 style={{ wordSpacing: '0.2em' }}>Build Intelligent AI Agents That Work as a Team</h1>

                    <div className="home-cta-buttons">
                        <button 
                            className="home-btn home-btn-primary" 
                            onClick={() => window.open('https://github.com/XiansAiPlatform', '_blank')}
                        >
                            <BiLogoGithub />
                            View on GitHub
                        </button>
                        <button 
                            className="home-btn home-btn-secondary" 
                            onClick={() => window.open('https://xiansaiplatform.github.io/XiansAi.PublicDocs/', '_blank')}
                        >
                            Documentation
                        </button>
                    </div>
                    <p className="home-hero-subtitle">
                        The open-source platform for creating, deploying, and managing sophisticated AI agent workflows with enterprise-grade reliability.
                    </p>

                    
                    {/* Add contributor avatars */}
                    <div className="contributors-section">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <img 
                                key={num}
                                src={`https://randomuser.me/api/portraits/men/${num + 20}.jpg`} 
                                alt={`Contributor ${num}`} 
                                className="contributor-avatar"
                                title={`Contributor ${num}`}
                            />
                        ))}
                    </div>
                    <div style={{ marginTop: '2rem' }}>
                        <code>
                            {'>'} dotnet add package XiansAi.Lib
                        </code>
                    </div>
                </div>
            </section>

            <section className="home-feature-showcase">
                <div className="home-tab-buttons">
                    {featureTabs.map((tab, index) => (
                        <button
                            key={index}
                            className={`home-tab-button ${activeTab === index ? 'active' : ''}`}
                            onClick={() => setActiveTab(index)}
                        >
                            {tab.icon}
                            {tab.title}
                        </button>
                    ))}
                </div>

                <div className="home-feature-content">
                    <div className="home-feature-image">
                        <img src={featureTabs[activeTab].image} alt={featureTabs[activeTab].title} />
                    </div>
                    <div className="home-feature-text">
                        <h2>{featureTabs[activeTab].title}</h2>
                        <p>{featureTabs[activeTab].description}</p>
                    </div>
                </div>
            </section>

            <section className="home-comparison">
                <div className="home-comparison-content">
                    <div className="home-comparison-text">
                        <h2>ADK Platform Comparison</h2>
                        <p>See how Xians.ai compares to other AI agent development platforms:</p>
                    </div>
                    <div className="home-comparison-table-container">
                        <table className="home-comparison-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Xians.ai</th>
                                    <th>Google ADK</th>
                                    <th>Rowboat</th>
                                    <th>OpenAI Agent SDK</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Hub & Spoke Handoffs</td>
                                    <td>✅</td>
                                    <td>✅</td>
                                    <td>✅</td>
                                    <td>✅</td>
                                </tr>
                                <tr>
                                    <td>P2P Handoffs</td>
                                    <td>✅</td>
                                    <td>❌</td>
                                    <td>❌</td>
                                    <td>❌</td>
                                </tr>
                                <tr>
                                    <td>Deterministic Workflow Orchestration</td>
                                    <td>✅</td>
                                    <td>✅</td>
                                    <td>❌</td>
                                    <td>❌</td>
                                </tr>
                                <tr>
                                    <td>Generative Workflow Orchestration</td>
                                    <td>✅</td>
                                    <td>✅</td>
                                    <td>✅</td>
                                    <td>✅</td>
                                </tr>
                                <tr>
                                    <td>Long-running Process Automation</td>
                                    <td>✅</td>
                                    <td>❌</td>
                                    <td>❌</td>
                                    <td>❌</td>
                                </tr>
                                <tr>
                                    <td>Functions + MCP Tools</td>
                                    <td>✅</td>
                                    <td>✅</td>
                                    <td>✅</td>
                                    <td>✅</td>
                                </tr>
                                <tr>
                                    <td>Event-driven Coordination</td>
                                    <td>✅</td>
                                    <td>✅</td>
                                    <td>❌</td>
                                    <td>❌</td>
                                </tr>
                                <tr>
                                    <td>Multi-tenancy</td>
                                    <td>✅</td>
                                    <td>❌</td>
                                    <td>❌</td>
                                    <td>❌</td>
                                </tr>
                                <tr>
                                    <td>Open Source</td>
                                    <td>✅</td>
                                    <td>✅</td>
                                    <td>✅</td>
                                    <td>✅</td>
                                </tr>
                                <tr>
                                    <td>No Vendor Lock-in</td>
                                    <td>✅</td>
                                    <td>✅</td>
                                    <td>✅</td>
                                    <td>❌</td>
                                </tr>
                                <tr>
                                    <td>Agent Visualization</td>
                                    <td>✅</td>
                                    <td>❌</td>
                                    <td>❌</td>
                                    <td>✅</td>
                                </tr>
                                <tr>
                                    <td>Multi-Cloud Deployment</td>
                                    <td>✅</td>
                                    <td>✅</td>
                                    <td>✅</td>
                                    <td>✅</td>
                                </tr>
                                <tr>
                                    <td>Enterprise-grade Robustness</td>
                                    <td>✅</td>
                                    <td>❌</td>
                                    <td>❌</td>
                                    <td>❌</td>
                                </tr>
                                <tr>
                                    <td>Agent Management Portal</td>
                                    <td>✅</td>
                                    <td>❌</td>
                                    <td>✅</td>
                                    <td>❌</td>
                                </tr>
                                <tr>
                                    <td>Prompt/Knowledge Base Management</td>
                                    <td>✅</td>
                                    <td>❌</td>
                                    <td>✅</td>
                                    <td>❌</td>
                                </tr>
                                <tr>
                                    <td>Agent Execution History</td>
                                    <td>✅</td>
                                    <td>❌</td>
                                    <td>❌</td>
                                    <td>❌</td>
                                </tr>
                                <tr>
                                    <td>Agent Tracing & Logging</td>
                                    <td>✅</td>
                                    <td>❌</td>
                                    <td>❌</td>
                                    <td>✅</td>
                                </tr>
                                <tr>
                                    <td>Rapid Agent Generation</td>
                                    <td>✅</td>
                                    <td>✅</td>
                                    <td>✅</td>
                                    <td>✅</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section className="home-code-demo">
                <div className="home-code-demo-content">
                    <div className="home-code-demo-text">
                        <h2>
                            Create Your First Multi-Tool Agent Workflow
                        </h2>
                        <p>Develop powerful AI workflows in minutes. Here's how to build a marketing content generation pipeline using multiple AI agents:</p>
                        
                        <div className="repo-activity-graph" title="Repository activity">
                            {/* Activity graph placeholder */}
                        </div>
                        
                        <ul className="home-code-demo-points">
                            <li>Define and reuse specialized agents for different tasks</li>
                            <li>Train agents to improve their work performance</li>
                            <li>Create a flow that coordinates between agents</li>
                            <li>Execute complex tasks in a durable, fault tolerant manner</li>
                        </ul>
                    </div>
                    <div className="home-code-demo-box">
                        <div className="home-code-header">
                            <div className="home-code-tabs">
                                {Object.entries(codeExamples).map(([key, { file }]) => (
                                    <button
                                        key={key}
                                        className={`home-code-tab ${activeCodeTab === key ? 'active' : ''}`}
                                        onClick={() => setActiveCodeTab(key)}
                                    >
                                        {file}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <SyntaxHighlighter
                            language="csharp"
                            style={vscDarkPlus}
                            className="home-code-block"
                        >
                            {codeExamples[activeCodeTab].code}
                        </SyntaxHighlighter>
                    </div>
                </div>
                <br></br>
                <div className="home-code-demo-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="home-code-demo-box">
                        <div className="home-code-header">
                            <h3 style={{ 
                                textAlign: 'center', 
                                width: '100%',
                                fontFamily: 'var(--font-family)',
                                fontWeight: 'var(--font-weight-semibold)',
                                letterSpacing: 'var(--letter-spacing-tight)',
                                color: 'var(--home-text-primary)'
                            }}>Read documentation to get started</h3>
                        </div>
                        <div className="home-code-block" style={{ 
                            padding: '2rem', 
                            textAlign: 'center',
                            background: 'var(--home-bg-darker)'
                        }}>
                            <p style={{ 
                                marginBottom: '1.5rem', 
                                color: 'var(--home-text-secondary)',
                                fontFamily: 'var(--font-family)',
                                fontSize: 'var(--text-base)',
                                lineHeight: '1.6'
                            }}>
                                Learn more about the Xians.ai platform and how to use it's capabilities to build your own AI Agents and Workflows.
                            </p>
                            <a 
                                href="https://xiansaiplatform.github.io/XiansAi.PublicDocs/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="home-btn home-btn-primary"
                                style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '0.5rem',
                                    fontFamily: 'var(--font-family)',
                                    fontWeight: 'var(--font-weight-medium)',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase'
                                }}
                            >
                                <FiSettings className="feature-icon-svg" />
                                Read Documentation
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="home-features">
                <div className="home-features-grid">
                    <div className="home-feature-card-large">
                        <h3>Escape Vendor Lock-In with Open Architecture</h3>
                        <p>Deploy AI agents from any source—whether from Xians.ai, other providers, or your own development team. 
                        Any containerized agent integrates seamlessly with our platform.</p>
                        <div className="home-tech-logos">
                            <img src="/images/docker-logo.png" alt="Docker" className="home-tech-logo" />
                            <img src="/images/kubernetes-logo.png"  alt="Kubernetes" className="home-tech-logo" />
                        </div>
                    </div>

                    <div className="home-feature-card-medium">
                        <h3>Enterprise-Grade Reliability</h3>
                        <p>Build dependable AI workflows without infrastructure complexity. 
                        Focus on business logic while we handle durability, scalability, and fault tolerance. 
                        Powered by <u><a className="home-feature-link" href="https://temporal.io" target="_blank" rel="noopener noreferrer">Temporal</a></u> 
                        {' '}for proven reliability.</p>
                        <div className="home-feature-code">
                            <div className="home-feature-languages">
                                {['Durable', 'Event Driven', 'Scalable', 'Fault Tolerant', 'Persistent State'].map((tab, index) => (
                                    <button 
                                        key={index}
                                        className={`home-feature-language ${activeFeatureTab === index ? 'active' : ''}`}
                                        onClick={() => handleTabClick(index)}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <SyntaxHighlighter
                                language="csharp"
                                style={vscDarkPlus}
                            >
                                {featureCodeExamples[activeFeatureTab]}
                            </SyntaxHighlighter>
                        </div>
                    </div>

                    <div className="home-feature-card-medium">
                        <h3>Accelerate Development with Ready-Made Agent Tools</h3>
                        <p>Create complex workflows using our comprehensive library of open-source agent tools.</p>
                        <div className="home-feature-code">
                        <SyntaxHighlighter
                                language="csharp"
                                style={vscDarkPlus}
                            >
                                {
`
[Agents("xiansai-agent/llm-completion")]  
[Agents("xiansai-agent/web-scraper")]  
[Agents("xiansai-agent/web-search")]  
[Agents("xiansai-agent/ms-teams")]  
[Agents("xiansai-agent/O365-planner")]  
// And many more...
`}
                            </SyntaxHighlighter>
                        </div>
                    </div>

                    <div className="home-feature-card-large">
                        <h3>Balance AI Autonomy with Human Control</h3>
                        <ul className="home-code-demo-points">
                            <li>Maintain control over critical business processes</li>
                            <li>Implement AI automation strategically after review</li>
                            <li>Keep human oversight in workflow design</li>
                            <li>Blend autonomy and orchestration seamlessly</li>
                        </ul>
                    </div>

                    <div className="home-feature-card-large">
                        <h3>Sophisticated Agents, Not Just Chatbots</h3>
                        <p>Our platform is designed to host sophisticated agents capable of executing complex tasks and workflows, far beyond simple chat interactions.</p>
                        <br></br>
                        <div className="home-feature-self-host">
                            <div>
                                <img src="/images/agent-anatomy.png" alt="Agent Anatomy"/>
                                <p>A workflow within an agent intelligently orchestrates between multiple tools that are augmented by prompts</p>
                            </div>
                            <div>
                                <img src="/images/multi-workflow-agent.png" alt="Multi-Workflow Agent"/>
                                <span>Agents can consist of multiple workflows, some for user interaction, others for business process capabilities.</span>
                            </div>
                        </div>  
                   
                    </div>

                    <div className="home-feature-card-medium">
                        <h3>Self-Host in Your Cloud</h3>
                        <div className="home-feature-self-host">
                            <div >
                                <img src="/images/deployment.png" alt="Deployment Architecture"/>
                                <span>Agent Platform Deployment</span>
                            </div>
                            <p style={{textAlign: 'left'}}>Deploy the Xians.ai platform and agents in your own infrastructure for complete control and compliance.</p>
                            <div className="self-host-features">
                                <div className="self-host-feature">
                                    <div className="feature-icon">
                                        <FiLock className="feature-icon-svg" />
                                    </div>
                                    <div className="feature-text">Keep sensitive data within your environment</div>
                                </div>
                                <div className="self-host-feature">
                                    <div className="feature-icon">
                                        <RiRocketLine className="feature-icon-svg" />
                                    </div>
                                    <div className="feature-text">Deploy as containers or app services</div>
                                </div>
                                <div className="self-host-feature">
                                    <div className="feature-icon">
                                        <RiExchangeLine className="feature-icon-svg" />
                                    </div>
                                    <div className="feature-text">Seamless integration with your existing cloud resources</div>
                                </div>
                                <div className="self-host-feature">
                                    <div className="feature-icon">
                                        <FiSettings className="feature-icon-svg" />
                                    </div>
                                    <div className="feature-text">Customize networking and security policies</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="home-feature-card-large">
                        <h3>Built for Multi-Tenancy</h3>
                        <p>Scale your AI operations across multiple customers with built-in tenant isolation. Deploy and manage agents per customer while maintaining unified oversight.</p>
                        <ul className="home-code-demo-points">
                            <li>Isolate agent execution between tenants</li>
                            <li>Activate or deactivate agents on a per-tenant</li>
                            <li>Maintain separate configurations for tenants</li>
                            <li>Centralized monitoring across tenants</li>
                        </ul>
                        <div className="home-feature-image" style={{maxHeight: "140px", display: "flex", justifyContent: "center", marginTop: "15px"}}>
                            {/* <img src="/images/multitenancy.png" alt="Multitenancy architecture" style={{maxHeight: "100%"}} /> */}
                        </div>
                    </div>                    
                </div>
            </section>

            {/* New Get Started CTA section */}
            <section className="home-get-started">
                <div className="home-get-started-content">
                    <h2>Ready to Get Started?</h2>
                    <p>Begin building intelligent workflows with Xians.ai today</p>
                    <div className="home-get-started-buttons">
                        {!isAuthenticated && (
                            <button 
                                className="home-btn home-btn-primary" 
                                onClick={() => loginWithRedirect()}
                            >
                                <BiLogoGithub className="home-btn-icon" />
                                Sign up with GitHub
                            </button>
                        )}
                        <button 
                            className="home-btn home-btn-secondary" 
                            onClick={() => window.open('https://xiansaiplatform.github.io/XiansAi.PublicDocs/', '_blank')}
                        >
                            Read the Docs
                        </button>
                        <button 
                            className="home-btn home-btn-secondary" 
                            onClick={() => window.open('https://api.xians.ai/api-docs/', '_blank')}
                        >
                            API Specifications
                        </button>
                    </div>
                </div>
            </section>

            <footer className="home-footer">
                <div className="home-footer-content">
                    <div className="home-footer-left">
                        <div className="home-footer-logo">
                            <span className="home-logo-flow">Xians</span>
                            <span className="footer-logo-ai">.ai</span>
                        </div>
                        <span className="home-footer-copyright">© {new Date().getFullYear()} Xians.ai. All rights reserved.</span>
                    </div>
                    <div className="home-footer-right">
                        <div className="home-footer-links">
                            <a href="/" className="home-footer-link">Privacy Policy</a>
                            <a href="/" className="home-footer-link">Terms of Service</a>
                            <a href="https://github.com/XiansAiPlatform" target="_blank" rel="noopener noreferrer" className="home-footer-link">
                                <BiLogoGithub className="home-footer-icon" />
                                GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
