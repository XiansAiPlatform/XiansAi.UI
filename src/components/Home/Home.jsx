import React, { useState } from 'react';
import './Home.css';
import { FiCode, FiCpu, FiDatabase, FiGitBranch } from 'react-icons/fi';
import { BiCodeBlock, BiLogoGithub } from 'react-icons/bi';
import { RiRobot2Fill, RiFlowChart } from 'react-icons/ri';
import { AiOutlineClose, AiOutlineTeam } from 'react-icons/ai';
import { TbBrandPython } from 'react-icons/tb';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activeCodeTab, setActiveCodeTab] = useState('flow');

  const featureTabs = [
    {
      title: "Flow Visualization",
      description: "Design and visualize complex AI workflows with our intuitive flow visualizer. See how your agents interact, and monitor data flow between tasks.",
      image: "/images/visualizer.png",
      icon: <RiFlowChart className="home-tab-icon" />
    },
    {
      title: "Execution Monitoring",
      description: "Track your AI workflows in real-time with comprehensive monitoring tools. Get detailed insights into agent performance, task completion status, and system metrics all in one place.",
      image: "/images/monitoring.png",
      icon: <FiCpu className="home-tab-icon" />
    },
    {
      title: "Agent Training",
      description: "Fine-tune and train your AI agents for specific tasks using our specialized training interface. Improve agent performance through iterative learning and detailed feedback loops.",
      image: "/images/training.png",
      icon: <RiRobot2Fill className="home-tab-icon" />
    }
  ];

  const codeExamples = {
    flow: {
      file: 'BloggerFlow.cs',
      code: `using XiansAi.Lib;

public class ContentFlow : Flow
{
    private readonly IAgent _researcher;
    private readonly IAgent _writer;

    public ContentFlow()
    {
        _researcher = new ResearchAgent();
        _writer = new WriterAgent();
    }

    public async Task<string> ExecuteAsync(string topic)
    {
        var research = await ResearchTopicAsync(topic);
        return await WriteArticleAsync(research);
    }

    private async Task<string> ResearchTopicAsync(string topic)
    {
        return await _researcher.RunAsync($"Research key points about: {topic}");
    }

    private async Task<string> WriteArticleAsync(string research)
    {
        return await _writer.RunAsync($"Write article using research: {research}");
    }
}`
    },
    agentOne: {
      file: 'ResearchAgent.cs',
      code: `using XiansAi.Lib;

public class ResearchAgent : Agent
{
    public ResearchAgent() : base("researcher")
    {
        Model = "gpt-4";
        Temperature = 0.7;
    }

    protected override async Task<string> ProcessAsync(string input)
    {
        // Custom research logic here
        var result = await LLMProvider.CompleteAsync(input);
        return await ValidateAndEnhanceResearch(result);
    }

    private async Task<string> ValidateAndEnhanceResearch(string research)
    {
        // Implement research validation and enhancement
        return research;
    }
}`
    },
    agentTwo: {
      file: 'WriterAgent.cs',
      code: `using XiansAi.Lib;

public class WriterAgent : Agent
{
    public WriterAgent() : base("writer")
    {
        Model = "gpt-4";
        Temperature = 0.8;
    }

    protected override async Task<string> ProcessAsync(string input)
    {
        // Custom writing logic here
        var result = await LLMProvider.CompleteAsync(input);
        return await FormatAndPolishContent(result);
    }

    private async Task<string> FormatAndPolishContent(string content)
    {
        // Implement content formatting and polishing
        return content;
    }
}`
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Add your login logic here
    setShowLogin(false);
  };

  return (
    <div className="home-container">
      <header className="home-header">
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
          <button className="home-btn home-btn-secondary" onClick={() => setShowLogin(true)}>Login</button>
          <button className="home-btn home-btn-primary">
            <BiLogoGithub className="home-btn-icon" />
            Sign up with GitHub
          </button>
        </div>
      </header>

      <section className="home-hero">
        <div className="home-hero-content">
          <h1>Reinvent Your Business with AI Workflows</h1>
          
          <div className="home-cta-buttons">
            <button className="home-btn home-btn-primary">Get Started</button>
            <button className="home-btn home-btn-secondary">Documentation</button>
          </div>
          <p className="home-hero-subtitle">We help engineers to 
             build intelligent and resilient business workflows that works, even while you sleep.</p>
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
          <div className="home-feature-text">
            <h2>{featureTabs[activeTab].title}</h2>
            <p>{featureTabs[activeTab].description}</p>
          </div>
          <div className="home-feature-image">
            <img src={featureTabs[activeTab].image} alt={featureTabs[activeTab].title} />
          </div>
        </div>
      </section>

      <section className="home-code-demo">
        <div className="home-code-demo-content">
          <div className="home-code-demo-text">
            <h2>
              Write Your First Multi-Agent Flow
            </h2>
            <p>Create powerful AI workflows in minutes with our intuitive framework. Here's how to create a content generation pipeline using multiple specialized agents:</p>
            <ul className="home-code-demo-points">
              <li>Define specialized agents for different tasks</li>
              <li>Create a workflow that coordinates between agents</li>
              <li>Execute complex tasks with simple, clean code</li>
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
              <button className="home-copy-button">
                Copy
              </button>
            </div>
            <pre className="home-code-block">
              <code>{codeExamples[activeCodeTab].code}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {showLogin && (
        <div className="home-login-modal-overlay">
          <div className="home-login-modal">
            <button className="home-close-button" onClick={() => setShowLogin(false)}>
              <AiOutlineClose />
            </button>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input type="email" placeholder="Email" required />
              <input type="password" placeholder="Password" required />
              <button type="submit" className="home-btn home-btn-primary">Login</button>
            </form>
          </div>
        </div>
      )}

      {/* Features Section */}
      <section className="home-features">
        <h2>Power in Your Hands</h2>
        <div className="home-features-grid">
          <div className="home-feature-card">
            <FiGitBranch className="home-feature-icon" />
            <h3>Deterministic & Autonomous Workflows</h3>
            <p>Seamlessly combine predictable business logic with autonomous AI capabilities. Create workflows that are both reliable and adaptively intelligent.</p>
          </div>
          <div className="home-feature-card">
            <FiDatabase className="home-feature-icon" />
            <h3>Long Running Durable Flows</h3>
            <p>Build resilient workflows that persist across sessions and handle extended operations. Your flows continue exactly where they left off, ensuring task completion.</p>
          </div>
          <div className="home-feature-card">
            <AiOutlineTeam className="home-feature-icon" />
            <h3>Human in the Loop</h3>
            <p>Integrate human oversight and decision-making at critical points in your AI workflows. Maintain control while leveraging automation.</p>
          </div>
          <div className="home-feature-card">
            <RiRobot2Fill className="home-feature-icon" />
            <h3>Bring Your Own Agent (BYOA)</h3>
            <p>Flexibility to integrate any AI model or agent. Use your preferred models, whether they're from OpenAI, Anthropic, or your own custom solutions.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
