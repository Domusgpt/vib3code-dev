# VIB34D Engine Evaluation Rubric

| Capability | Weight | Quaternion SDK Notes | Vib3-Plus Notes |
| --- | --- | --- | --- |
| WebGPU performance (ms/frame) | 3 | _To be measured with demo scene_ | _To be measured with demo scene_ |
| WebGL2 fallback parity | 3 | _Pending integration test_ | _Pending integration test_ |
| 4D rotation/projection fidelity | 2 | Mathematical baseline in adapter | Requires warp accuracy validation |
| Morphing continuity | 2 | Driven via transition engine callbacks | Dependent on warp bridge hooks |
| Polytope warp quality | 2 | Not available | Placeholder factor-based warp |
| Integration effort | 1 | Adapter scaffold ready | Adapter scaffold ready |
| Telemetry + hooks | 1 | Auto-batching bridge provided | Auto-batching bridge provided |
| Docs/maintainability | 1 | Typed interface & config docs | Typed interface & config docs |

Populate the rubric after benchmarking identical demo scenes via `apps/vib34d-demo` using the URL parameter `?adapter=quaternion` or `?adapter=vib3plus`.
