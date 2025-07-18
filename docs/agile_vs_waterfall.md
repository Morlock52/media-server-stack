# Agile vs. Waterfall: Developer Perspective

This document summarizes the key differences between agile and waterfall methodologies from a developer's point of view with real examples. Each point references an external source for credibility.

## Major Differences

| Aspect | Agile Approach | Waterfall Approach | Example |
|-------|---------------|------------------|---------|
| **Requirements** | Incremental and adaptable; teams refine requirements each sprint | Fixed at project start with sequential phases | Kubernetes publishes new features in each release, updating docs as features move from alpha to beta【99e28c†L1-L29】 |
| **Developer Involvement** | Cross-functional teams collaborate continuously and demo work for feedback | Developers implement a detailed spec with little customer contact until delivery | IBM notes agile teams show work each sprint for stakeholder feedback, while waterfall involves customers mainly at final delivery【f1f6b9†L1-L10】 |
| **Testing** | Continuous testing throughout iterations | Testing occurs near the end, making issues risky to fix | Winston Royce described late waterfall testing as "risky and [inviting] failure" in his 1970 paper【e13ea3†L6-L18】 |
| **Flexibility** | Embraces change even late in development | Changes are expensive once phases are completed | Agile Manifesto values "responding to change" over following a rigid plan【1239e8†L1-L4】 |

## Additional Notes
- Waterfall methods were historically used for large, safety-critical projects like early NASA software where requirements had to be fully defined before development.
- Agile methods power many modern open-source initiatives such as Kubernetes, where small teams iterate rapidly and release frequently.

