import React, { useState } from 'react';
import '../Public.css';
import { FiCpu } from 'react-icons/fi';
import { BiLogoGithub } from 'react-icons/bi';
import { RiRobot2Fill, RiFlowChart } from 'react-icons/ri';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Home() {
    const [activeTab, setActiveTab] = useState(0);
    const [activeCodeTab, setActiveCodeTab] = useState('flow');
    const [activeFeatureTab, setActiveFeatureTab] = useState(0);

    const featureTabs = [
        {
            title: "Flow Visualization",
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
            file: 'ResearchAgent.cs',
            code: `[Agents("xiansai-agent/web-research")]
[Instructions("Competitor-Urls", "How-To-Research-Blog-Topics")]
public class ResearchAgent : AgentStub,  IResearchAgent
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
            file: 'WriterAgent.cs',
            code: `[Agents("xiansai-agent/blog-publisher")]
[Instructions("How-To-Write-Blogs")]
public class WriterAgent : AgentStub, IWriterAgent
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
                    <div className="home-auth-buttons">
                        <button className="home-btn home-btn-secondary" onClick={() => window.location.href = '/login'}>
                            Login
                        </button>
                        <button className="home-btn home-btn-primary" onClick={() => window.open('/login')}>
                            <BiLogoGithub />
                            Sign up with GitHub
                        </button>
                    </div>
                </div>
            </header>

            <section className="home-hero">
                <div className="home-hero-content">
                    <h1>Reinvent Your Business with AI Workflows</h1>

                    <div className="home-cta-buttons" >
                        <button className="home-btn home-btn-secondary" onClick={() => window.open('https://xiansaiplatform.github.io/XiansAi.Website/getting-started/setting-up/', '_blank')}>Documentation</button>
                    </div>
                    <p className="home-hero-subtitle">
                        Build intelligent, resilient business workflows that operate reliably at scale - even while you sleep.
                    </p>
                    <div className="code-sample">
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

            <section className="home-code-demo">
                <div className="home-code-demo-content">
                    <div className="home-code-demo-text">
                        <h2>
                            Write Your First Multi-Agent Flow
                        </h2>
                        <p>Create powerful AI workflows in minutes. Here's how to create a marketing content generation pipeline using multiple AI agents:</p>
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
            </section>


            {/* Features Section */}
            <section className="home-features">
                <div className="home-features-grid">
                    <div className="home-feature-card-large">
                        <h3>Avoid Vendor Lock-In with Open Architecture</h3>
                        <p>Deploy AI agents from any source - whether from Xians.ai, other providers, or your own development team. 
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
                        <h3>Fast Build with our Ready Made Agents</h3>
                        <p>Create complex workflows using our open-source agents.</p>
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
[Agents("xiansai-agent/ms-teams-chat")]  
[Agents("xiansai-agent/0365-planner")]  
// And many more...
`}
                            </SyntaxHighlighter>
                        </div>
                    </div>

                    <div className="home-feature-card-large">
                        <h3>Balance AI Autonomy with Control</h3>
                        <ul className="home-code-demo-points">
                            <li>Maintain control over critical business processes</li>
                            <li>Implement AI automation strategically after review</li>
                            <li>Keep human oversight in workflow designing</li>
                            <li>Blend autonomy and orchestration seamlessly</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* New Get Started CTA section */}
            <section className="home-get-started">
                <div className="home-get-started-content">
                    <h2>Ready to Get Started?</h2>
                    <p>Begin building intelligent workflows with Xians.ai today</p>
                    <div className="home-get-started-buttons">
                        <button className="home-btn home-btn-primary" onClick={() => window.open('/login')}>
                            <BiLogoGithub className="home-btn-icon" />
                            Sign up with GitHub
                        </button>
                        <button className="home-btn home-btn-secondary" onClick={() => window.open('https://xiansaiplatform.github.io/XiansAi.Website/getting-started/setting-up/', '_blank')}>
                            Read the Docs
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
                            <a href="https://github.com/xiansaiplatform" target="_blank" rel="noopener noreferrer" className="home-footer-link">
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
