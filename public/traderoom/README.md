# Traderoom Assets Organization

This directory contains all assets specifically for the traderoom interface.

## Directory Structure

```
/public/traderoom/
├── assets/          # General traderoom assets (icons, logos, etc.)
├── backgrounds/     # Background images and patterns
│   ├── world-map-dots.svg      # Simple dotted world map background
│   └── world-map-detailed.svg  # Detailed dotted world map background
├── traderoom.css    # Traderoom-specific CSS styles
└── README.md        # This documentation file
```

## Files

### Backgrounds
- `world-map-dots.svg` - Simple dotted world map pattern for chart background
  - Basic continents outline with subtle dots
  - Low opacity for minimal visual impact
- `world-map-detailed.svg` - Detailed dotted world map pattern (recommended)
  - More accurate world map representation
  - Multiple dot densities for visual depth
  - Optimized SVG format for scalability
  - Low opacity (#404040 at 12-18% opacity) for subtle effect
  - Dotted pattern matching IQ Option style

### Styles
- `traderoom.css` - CSS classes for easy background application
  - `.traderoom-chart-bg` - Full cover world map background
  - `.traderoom-chart-bg-small` - Contained world map background
  - `.chart-content-overlay` - Content readability overlay
  - `.traderoom-chart-animated` - Animated world map effect

## Usage

### World Map Background
```tsx
// In chart component
<div 
  className="chart-container"
  style={{
    backgroundImage: 'url(/traderoom/backgrounds/world-map-dots.svg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }}
>
  {/* Chart content */}
</div>
```

## Adding New Assets

When adding new traderoom assets:
1. Place general assets in `/assets/` 
2. Place background images in `/backgrounds/`
3. Use descriptive, kebab-case filenames
4. Optimize images for web (SVG preferred for graphics)
5. Update this README with new additions