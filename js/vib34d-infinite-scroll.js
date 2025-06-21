/**
 * VIB34D INFINITE SCROLL + PORTAL TRANSITIONS
 * Handles scroll velocity detection and geometry morphing transitions
 * 
 * Core concept: Scroll speed drives portal intensity
 * - Slow scroll = gentle morphing
 * - Fast scroll = dramatic portal effects with dimensional shifts
 */

console.log('🌊 VIB34D Infinite Scroll + Portal Transitions Loading...');

// ===== INFINITE SCROLL MANAGER =====
class VIB34DInfiniteScroll {
    constructor(styleSystem) {
        this.styleSystem = styleSystem;
        
        // Section configuration with snap points
        this.sections = [
            { key: 'home', geometry: 'hypercube', snapPoint: 0 },
            { key: 'articles', geometry: 'tetrahedron', snapPoint: 1000 },
            { key: 'videos', geometry: 'sphere', snapPoint: 2000 },
            { key: 'podcasts', geometry: 'torus', snapPoint: 3000 },
            { key: 'ema', geometry: 'wave', snapPoint: 4000 }
        ];
        
        // Scroll state tracking
        this.currentSection = 0;
        this.scrollVelocity = 0;
        this.lastScrollY = window.scrollY;
        this.lastScrollTime = Date.now();
        this.isTransitioning = false;
        this.velocityHistory = [];
        
        // Configuration
        this.config = {
            // ===== SCROLL VELOCITY THRESHOLDS =====
            gentleThreshold: 10,      // Slow scroll - gentle morphing
            standardThreshold: 50,    // Medium scroll - standard transition  
            dramaticThreshold: 100,   // Fast scroll - dramatic portal effects
            
            // ===== TRANSITION TIMING =====
            transitionDuration: 2000,  // Milliseconds for geometry morphing
            portalIntensity: 0.8,       // Portal effect strength (0.0-1.0)
            dimensionShift: 0.5,        // 4D space distortion during transition
            
            // ===== SNAP SETTINGS =====
            snapSensitivity: 0.3,      // How easily sections snap (0.1-1.0)
            snapDuration: 800,         // Smooth scrolling duration (ms)
            snapThreshold: 200,        // Pixel distance to trigger snap
            
            // ===== VELOCITY CALCULATION =====
            velocitySmoothing: 5,      // Number of samples for velocity average
            velocityDecay: 0.9,        // How quickly velocity decays
            maxVelocity: 500          // Cap velocity calculations
        };
        
        this.setupScrollListeners();
        this.setupResizeHandler();
        
        console.log('🌊 Infinite scroll system initialized');
    }
    
    setupScrollListeners() {
        // Main scroll handler with throttling
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            this.updateScrollVelocity();
            this.detectSectionTransitions();
            
            // Clear previous timeout
            clearTimeout(scrollTimeout);
            
            // Set timeout to handle scroll end
            scrollTimeout = setTimeout(() => {
                this.handleScrollEnd();
            }, 150);
        }, { passive: true });
        
        // Wheel event for detecting scroll direction and intent
        window.addEventListener('wheel', (e) => {
            this.handleWheelEvent(e);
        }, { passive: true });
        
        // Touch events for mobile
        let touchStartY = 0;
        window.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        window.addEventListener('touchmove', (e) => {
            const touchY = e.touches[0].clientY;
            const deltaY = touchStartY - touchY;
            this.handleTouchScroll(deltaY);
        }, { passive: true });
    }
    
    updateScrollVelocity() {
        const now = Date.now();
        const currentScrollY = window.scrollY;
        const deltaY = currentScrollY - this.lastScrollY;
        const deltaTime = now - this.lastScrollTime;
        
        if (deltaTime > 0) {
            // Calculate velocity (pixels per millisecond)
            const velocity = Math.abs(deltaY / deltaTime * 100);
            
            // Add to velocity history for smoothing
            this.velocityHistory.push(velocity);
            if (this.velocityHistory.length > this.config.velocitySmoothing) {
                this.velocityHistory.shift();
            }
            
            // Calculate smoothed velocity
            this.scrollVelocity = this.velocityHistory.reduce((sum, v) => sum + v, 0) / this.velocityHistory.length;
            this.scrollVelocity = Math.min(this.scrollVelocity, this.config.maxVelocity);
            
            // Determine portal intensity based on velocity
            const portalIntensity = this.calculatePortalIntensity(this.scrollVelocity);
            
            // Propagate scroll interaction to style system
            this.styleSystem.propagateInteraction({
                type: 'scroll',
                scrollVelocity: this.scrollVelocity,
                portalIntensity: portalIntensity,
                intensity: Math.min(this.scrollVelocity / 50, 1.0),
                scrollDirection: deltaY > 0 ? 'down' : 'up'
            });
        }
        
        this.lastScrollY = currentScrollY;
        this.lastScrollTime = now;
    }
    
    calculatePortalIntensity(scrollVelocity) {
        // Map scroll velocity to portal effects
        if (scrollVelocity < this.config.gentleThreshold) {
            return 'gentle';
        } else if (scrollVelocity < this.config.standardThreshold) {
            return 'standard';
        } else if (scrollVelocity < this.config.dramaticThreshold) {
            return 'dramatic';
        } else {
            return 'extreme';
        }
    }
    
    detectSectionTransitions() {
        const currentScrollY = window.scrollY;
        const targetSection = this.calculateTargetSection(currentScrollY);
        
        if (targetSection !== this.currentSection && !this.isTransitioning) {
            this.triggerSectionTransition(targetSection);
        }
    }
    
    calculateTargetSection(scrollY) {
        // Find which section we're currently in based on scroll position
        for (let i = this.sections.length - 1; i >= 0; i--) {
            if (scrollY >= this.sections[i].snapPoint - this.config.snapThreshold) {
                return i;
            }
        }
        return 0;
    }
    
    async triggerSectionTransition(targetSectionIndex) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        const targetSection = this.sections[targetSectionIndex];
        const previousSection = this.sections[this.currentSection];
        
        console.log(`🌊 Portal transition: ${previousSection.key} → ${targetSection.key} (velocity: ${this.scrollVelocity.toFixed(1)})`);
        
        // Calculate transition effects based on scroll velocity
        const portalEffects = this.calculatePortalEffects();
        
        // Apply portal effects to all visible sections
        await this.applyPortalEffects(portalEffects, previousSection.geometry, targetSection.geometry);
        
        // Update style system current section
        await this.styleSystem.transitionToSection(targetSection.key);
        
        this.currentSection = targetSectionIndex;
        
        // Clear transition flag after duration
        setTimeout(() => {
            this.isTransitioning = false;
        }, this.config.transitionDuration);
    }
    
    calculatePortalEffects() {
        const intensity = this.calculatePortalIntensity(this.scrollVelocity);
        
        const effects = {
            gentle: { 
                glitchIntensity: 0.1, 
                morphSpeed: 1.0, 
                dimensionShift: 0.05,
                colorShift: 0.1,
                gridDistortion: 0.2
            },
            standard: { 
                glitchIntensity: 0.3, 
                morphSpeed: 1.5, 
                dimensionShift: 0.2,
                colorShift: 0.3,
                gridDistortion: 0.4
            },
            dramatic: { 
                glitchIntensity: 0.6, 
                morphSpeed: 2.0, 
                dimensionShift: 0.4,
                colorShift: 0.5,
                gridDistortion: 0.7
            },
            extreme: {
                glitchIntensity: 0.9,
                morphSpeed: 3.0,
                dimensionShift: 0.6,
                colorShift: 0.8,
                gridDistortion: 1.0
            }
        };
        
        return effects[intensity] || effects.standard;
    }
    
    async applyPortalEffects(effects, fromGeometry, toGeometry) {
        // Get all active multi-instance managers
        const managers = this.styleSystem.multiInstanceManagers;
        
        // Apply portal effects to each section's visualizers
        managers.forEach((manager, sectionKey) => {
            const sectionData = this.styleSystem.sections.get(sectionKey);
            
            if (sectionData && sectionData.isVisible) {
                // Apply enhanced interaction effects during transition
                manager.updateInteractionState({
                    type: 'portal_transition',
                    intensity: effects.glitchIntensity,
                    morphSpeed: effects.morphSpeed,
                    dimensionShift: effects.dimensionShift,
                    colorShift: effects.colorShift,
                    gridDistortion: effects.gridDistortion,
                    fromGeometry: fromGeometry,
                    toGeometry: toGeometry
                });
            }
        });
        
        console.log(`🌀 Portal effects applied: glitch=${effects.glitchIntensity}, morph=${effects.morphSpeed}`);
    }
    
    handleWheelEvent(e) {
        // Detect rapid wheel events for enhanced portal effects
        const wheelVelocity = Math.abs(e.deltaY);
        
        if (wheelVelocity > 100) {
            // Rapid wheel scrolling - enhance portal effects
            this.styleSystem.propagateInteraction({
                type: 'rapid_scroll',
                intensity: 0.8,
                wheelVelocity: wheelVelocity,
                direction: e.deltaY > 0 ? 'down' : 'up'
            });
        }
    }
    
    handleTouchScroll(deltaY) {
        // Handle touch-based scrolling for mobile
        const touchVelocity = Math.abs(deltaY);
        
        this.styleSystem.propagateInteraction({
            type: 'touch_scroll',
            intensity: Math.min(touchVelocity / 100, 1.0),
            touchVelocity: touchVelocity,
            direction: deltaY > 0 ? 'down' : 'up'
        });
    }
    
    handleScrollEnd() {
        // Handle scroll completion - potentially snap to section
        this.scrollVelocity *= this.config.velocityDecay;
        
        if (this.scrollVelocity < 5 && this.config.snapSensitivity > 0) {
            this.considerSnapToSection();
        }
        
        // Fade portal effects
        this.styleSystem.propagateInteraction({
            type: 'scroll_end',
            intensity: 0,
            scrollVelocity: 0
        });
    }
    
    considerSnapToSection() {
        const currentScrollY = window.scrollY;
        const targetSectionIndex = this.calculateTargetSection(currentScrollY);
        const targetSnapPoint = this.sections[targetSectionIndex].snapPoint;
        
        const distanceToSnap = Math.abs(currentScrollY - targetSnapPoint);
        
        if (distanceToSnap < this.config.snapThreshold && distanceToSnap > 10) {
            this.snapToSection(targetSectionIndex);
        }
    }
    
    snapToSection(sectionIndex) {
        const targetSnapPoint = this.sections[sectionIndex].snapPoint;
        
        // Smooth scroll to snap point
        window.scrollTo({
            top: targetSnapPoint,
            behavior: 'smooth'
        });
        
        console.log(`📍 Snapped to section: ${this.sections[sectionIndex].key}`);
    }
    
    setupResizeHandler() {
        // Recalculate snap points on window resize
        window.addEventListener('resize', () => {
            this.recalculateSnapPoints();
        });
    }
    
    recalculateSnapPoints() {
        // Dynamically update snap points based on actual section positions
        this.styleSystem.sections.forEach((sectionData, sectionKey) => {
            const sectionIndex = this.sections.findIndex(s => s.key === sectionKey);
            if (sectionIndex !== -1) {
                const rect = sectionData.element.getBoundingClientRect();
                const scrollTop = window.scrollY;
                this.sections[sectionIndex].snapPoint = scrollTop + rect.top;
            }
        });
        
        console.log('📍 Snap points recalculated');
    }
    
    // ===== PUBLIC API =====
    
    scrollToSection(sectionKey, smooth = true) {
        const sectionIndex = this.sections.findIndex(s => s.key === sectionKey);
        if (sectionIndex !== -1) {
            const snapPoint = this.sections[sectionIndex].snapPoint;
            window.scrollTo({
                top: snapPoint,
                behavior: smooth ? 'smooth' : 'instant'
            });
        }
    }
    
    getCurrentSection() {
        return this.sections[this.currentSection];
    }
    
    getScrollVelocity() {
        return this.scrollVelocity;
    }
    
    setScrollConfig(newConfig) {
        Object.assign(this.config, newConfig);
        console.log('🔧 Scroll configuration updated');
    }
    
    enable() {
        this.enabled = true;
        console.log('🌊 Infinite scroll enabled');
    }
    
    disable() {
        this.enabled = false;
        this.scrollVelocity = 0;
        console.log('🌊 Infinite scroll disabled');
    }
    
    destroy() {
        // Cleanup event listeners
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('wheel', this.handleWheelEvent);
        window.removeEventListener('resize', this.recalculateSnapPoints);
        
        console.log('🗑️ Infinite scroll system destroyed');
    }
}

// Export for VIB34D Style System
window.VIB34DInfiniteScroll = VIB34DInfiniteScroll;
console.log('✅ VIB34D Infinite Scroll + Portal Transitions loaded');