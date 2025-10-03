import { useEffect, useRef } from 'react';

interface WeatherEffectsProps {
  type?: 'clear' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  intensity?: number;
}

export function WeatherEffects({ type = 'clear', intensity = 50 }: WeatherEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Cloud {
      x: number;
      y: number;
      width: number;
      height: number;
      speed: number;
      opacity: number;
    }

    interface Particle {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color?: string;
      length?: number;
    }

    const particles: Particle[] = [];
    const clouds: Cloud[] = [];
    let lightning = { active: false, opacity: 0 };
    let sunRays: { angle: number; intensity: number } = { angle: 0, intensity: 1 };

    // Initialize clouds for cloudy/rainy/stormy weather
    if (type === 'cloudy' || type === 'rainy' || type === 'stormy') {
      for (let i = 0; i < 5; i++) {
        clouds.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.3,
          width: 150 + Math.random() * 100,
          height: 60 + Math.random() * 40,
          speed: 0.2 + Math.random() * 0.3,
          opacity: type === 'stormy' ? 0.8 : 0.6,
        });
      }
    }

    // Initialize particles based on weather type
    const particleCount = type === 'clear' ? 30 : intensity;
    
    for (let i = 0; i < particleCount; i++) {
      if (type === 'rainy' || type === 'stormy') {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          z: Math.random() * 1000,
          vx: type === 'stormy' ? (Math.random() - 0.5) * 2 : 0,
          vy: type === 'stormy' ? Math.random() * 8 + 6 : Math.random() * 5 + 3,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.3,
          length: type === 'stormy' ? 20 : 15,
          color: type === 'stormy' ? 'rgba(150, 150, 255, ' : 'rgba(100, 150, 200, ',
        });
      } else if (type === 'snowy') {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          z: Math.random() * 1000,
          vx: (Math.random() - 0.5) * 1,
          vy: Math.random() * 2 + 0.5,
          size: Math.random() * 4 + 2,
          opacity: Math.random() * 0.6 + 0.4,
          color: 'rgba(255, 255, 255, ',
        });
      } else if (type === 'clear') {
        // Floating particles for clear weather
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * 1000,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.3 + 0.1,
          color: 'rgba(255, 255, 200, ',
        });
      }
    }

    function drawCloud(cloud: Cloud) {
      ctx.save();
      ctx.globalAlpha = cloud.opacity;
      
      // Create cloud gradient
      const gradient = ctx.createRadialGradient(
        cloud.x + cloud.width / 2, cloud.y + cloud.height / 2, 0,
        cloud.x + cloud.width / 2, cloud.y + cloud.height / 2, cloud.width / 2
      );
      
      if (type === 'stormy') {
        gradient.addColorStop(0, 'rgba(50, 50, 60, 0.9)');
        gradient.addColorStop(1, 'rgba(80, 80, 90, 0.4)');
      } else {
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(1, 'rgba(220, 220, 220, 0.3)');
      }
      
      ctx.fillStyle = gradient;
      
      // Draw cloud shape with multiple circles
      for (let i = 0; i < 6; i++) {
        const offsetX = Math.sin(i) * cloud.width / 3;
        const offsetY = Math.cos(i) * cloud.height / 4;
        ctx.beginPath();
        ctx.arc(
          cloud.x + cloud.width / 2 + offsetX,
          cloud.y + cloud.height / 2 + offsetY,
          cloud.width / 3,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      
      ctx.restore();
    }

    function drawSunRays() {
      if (type !== 'clear') return;
      
      ctx.save();
      ctx.globalAlpha = 0.3;
      
      const centerX = canvas.width * 0.8;
      const centerY = canvas.height * 0.2;
      
      // Draw sun
      const sunGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100);
      sunGradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
      sunGradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw rays
      ctx.strokeStyle = 'rgba(255, 255, 200, 0.2)';
      ctx.lineWidth = 2;
      
      for (let i = 0; i < 12; i++) {
        const angle = (i * 30 + sunRays.angle) * Math.PI / 180;
        const x1 = centerX + Math.cos(angle) * 120;
        const y1 = centerY + Math.sin(angle) * 120;
        const x2 = centerX + Math.cos(angle) * 200;
        const y2 = centerY + Math.sin(angle) * 200;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      
      ctx.restore();
    }

    function drawLightning() {
      if (!lightning.active || type !== 'stormy') return;
      
      ctx.save();
      ctx.globalAlpha = lightning.opacity;
      ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(150, 150, 255, 1)';
      
      const startX = Math.random() * canvas.width;
      let currentX = startX;
      let currentY = 0;
      
      ctx.beginPath();
      ctx.moveTo(currentX, currentY);
      
      while (currentY < canvas.height) {
        currentY += Math.random() * 50 + 20;
        currentX += (Math.random() - 0.5) * 100;
        ctx.lineTo(currentX, currentY);
      }
      
      ctx.stroke();
      ctx.restore();
    }

    function animate() {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw sun rays for clear weather
      if (type === 'clear') {
        drawSunRays();
        sunRays.angle += 0.1;
      }

      // Draw and update clouds
      clouds.forEach((cloud) => {
        drawCloud(cloud);
        cloud.x += cloud.speed;
        if (cloud.x > canvas.width + cloud.width) {
          cloud.x = -cloud.width;
        }
      });

      // Lightning for stormy weather
      if (type === 'stormy') {
        if (Math.random() > 0.98 && !lightning.active) {
          lightning.active = true;
          lightning.opacity = 1;
        }
        if (lightning.active) {
          drawLightning();
          lightning.opacity -= 0.1;
          if (lightning.opacity <= 0) {
            lightning.active = false;
          }
        }
      }

      // Draw and update particles
      particles.forEach((particle) => {
        ctx.save();
        ctx.globalAlpha = particle.opacity;

        if (type === 'rainy' || type === 'stormy') {
          // Draw rain
          const gradient = ctx.createLinearGradient(
            particle.x, particle.y,
            particle.x, particle.y + (particle.length || 15)
          );
          gradient.addColorStop(0, particle.color + '0.8)');
          gradient.addColorStop(1, particle.color + '0)');
          ctx.strokeStyle = gradient;
          ctx.lineWidth = particle.size;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x + particle.vx, particle.y + (particle.length || 15));
          ctx.stroke();
        } else if (type === 'snowy') {
          // Draw snowflakes
          ctx.fillStyle = particle.color + particle.opacity + ')';
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Add snowflake pattern
          ctx.strokeStyle = particle.color + (particle.opacity * 0.5) + ')';
          ctx.lineWidth = 1;
          for (let i = 0; i < 6; i++) {
            const angle = (i * 60) * Math.PI / 180;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(
              particle.x + Math.cos(angle) * particle.size * 2,
              particle.y + Math.sin(angle) * particle.size * 2
            );
            ctx.stroke();
          }
        } else if (type === 'clear') {
          // Draw floating dust/pollen particles
          ctx.fillStyle = particle.color + particle.opacity + ')';
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // Update particle position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.y > canvas.height) {
          particle.y = -20;
          particle.x = Math.random() * canvas.width;
        }
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;

        // Floating motion for clear weather
        if (type === 'clear') {
          particle.vx += (Math.random() - 0.5) * 0.01;
          particle.vy += (Math.random() - 0.5) * 0.01;
          particle.vx *= 0.99;
          particle.vy *= 0.99;
        }

        // Swaying motion for snow
        if (type === 'snowy') {
          particle.vx = Math.sin(Date.now() * 0.001 + particle.x) * 0.5;
        }
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [type, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ opacity: type === 'clear' ? 0.4 : 0.7 }}
    />
  );
}