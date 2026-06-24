---
name: react-best-practices
description: Review React and Next.js/Vite performance, re-render, bundle, and hooks best practices.
---

# React Best Practices Skill

Use this skill when developing React components or hooks to ensure high-performance execution, low bundle overhead, and clean component architecture.

## Rules
1. **No Waterfalls**: Do not execute hooks or API calls sequentially if they can be fetched in parallel.
2. **Bundle Optimization**: Avoid importing full libraries if only a subset of functions/icons are needed. Do not use massive barrel imports for initial bundle loads.
3. **Optimized Re-renders**: Never define inline React components inside another component's body. Use `useMemo` and `useCallback` strategically.
4. **React Hooks**: Follow React Hooks rules strictly; handle deps arrays in `useEffect` and `useMemo` correctly.
