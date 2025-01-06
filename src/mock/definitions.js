export const mockDefinitions = [
  {
    "id": "677beadc9377ff2463891e5a",
    "typeName": "ProspectingFlow",
    "className": "ProspectingFlow",
    "hash": "1383a02378d0ed0430cc16e5dec43ef6a7140423a8fa1bcbe0b4814fd1c6c501",
    "source": null,
    "markdown": "flowchart TD\n    classDef startEvent fill:#9acd32,stroke:#666,stroke-width:2px;\n    // ... rest of markdown ...",
    "activities": [
      {
        "activityName": "IScrapeNewsLinksActivity",
        "dockerImage": "flowmaxer/scraper-agent",
        "instructions": ["HowToScrapeArticleLinks"],
        "parameters": [
          {
            "name": "source",
            "type": "String"
          }
        ]
      },
      // ... other activities ...
    ],
    "parameters": [
      {
        "name": "sourceLink",
        "type": "String"
      }
    ],
    "createdAt": "2025-01-06T14:38:27.952Z"
  },
  {
    "id": "677be92d9377ff2463891e57",
    "typeName": "MarketingFlow",
    "className": "MarketingFlow",
    "hash": "f9e295eeea649d16e4ff884cce5d5fa91dd2027c90597275a81a750bcbc8cf37",
    "source": null,
    "markdown": "flowchart TD\n  classDef startEvent fill:#9acd32,stroke:#666,stroke-width:2px;\n  // ... rest of markdown ...",
    "activities": [
      {
        "activityName": "ILinkActivity",
        "dockerImage": "flowmaxer/scraper-agent",
        "instructions": [
          "You are a scraper",
          "find links"
        ],
        "parameters": [
          {
            "name": "sourceLink",
            "type": "String"
          },
          {
            "name": "prompt",
            "type": "String"
          }
        ]
      },
      // ... other activities ...
    ],
    "parameters": [
      {
        "name": "sourceLink",
        "type": "String"
      },
      {
        "name": "prompt",
        "type": "String"
      }
    ],
    "createdAt": "2025-01-06T14:31:13.495Z"
  }
]; 