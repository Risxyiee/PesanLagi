"use client";

import { useEffect, useRef } from "react";
import bodyHtml from "./body-html.json";
import { styles } from "./styles";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // === Global functions for inline onclick handlers ===
    function showToast(message: string) {
      const toast = document.getElementById('toast');
      const msg = document.getElementById('toast-message');
      if (toast && msg) {
        (msg as HTMLElement).textContent = message;
        toast.classList.add('show');
        clearTimeout((window as any)._toastTimer);
        (window as any)._toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
      }
    }

    function openModal(id: string) {
      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeModal(id: string) {
      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }

    function toggleFaq(btn: HTMLElement) {
      const item = (btn as HTMLElement).closest('.faq-item');
      if (!item) return;
      const answer = item.querySelector('.faq-answer') as HTMLElement;
      if (!answer) return;
      const isActive = item.classList.contains('active');

      const allItems = item.closest('.modal-box')?.querySelectorAll('.faq-item') || [];
      allItems.forEach((otherItem: Element) => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherAnswer = otherItem.querySelector('.faq-answer') as HTMLElement;
          if (otherAnswer) otherAnswer.style.maxHeight = '0';
        }
      });

      if (isActive) {
        item.classList.remove('active');
        answer.style.maxHeight = '0';
      } else {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    }

    // Make functions global for inline onclick handlers
    (window as any).showToast = showToast;
    (window as any).openModal = openModal;
    (window as any).closeModal = closeModal;
    (window as any).toggleFaq = toggleFaq;

    // === Mobile menu ===
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenuBtn?.addEventListener('click', () => {
      mobileMenu?.classList.toggle('open');
    });
    mobileMenu?.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileMenu?.classList.remove('open'));
    });

    // === Reveal on scroll ===
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          const counters = entry.target.querySelectorAll('.counter');
          counters.forEach((c: Element) => animateCounter(c as HTMLElement));
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(el => observer.observe(el));

    // === Counter animation ===
    function animateCounter(el: HTMLElement) {
      if (el.dataset.animated) return;
      el.dataset.animated = 'true';
      const target = parseFloat(el.dataset.target || '0');
      const isDecimal = el.dataset.decimal === '1';
      const duration = 2000;
      const start = performance.now();

      function step(now: number) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;

        if (isDecimal) {
          el.textContent = (value / 10).toFixed(1);
        } else {
          el.textContent = String(Math.floor(value));
        }

        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = isDecimal ? (target / 10).toFixed(1) : String(target);
      }
      requestAnimationFrame(step);
    }

    // === QR Code generation ===
    function generateQRPattern(size = 21) {
      const pattern: number[][] = [];
      for (let i = 0; i < size; i++) {
        pattern[i] = new Array(size).fill(0);
      }

      const addFinder = (sr: number, sc: number) => {
        for (let i = 0; i < 7; i++) {
          for (let j = 0; j < 7; j++) {
            if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
              pattern[sr + i][sc + j] = 1;
            }
          }
        }
      };
      addFinder(0, 0);
      addFinder(0, size - 7);
      addFinder(size - 7, 0);

      for (let i = 8; i < size - 8; i++) {
        pattern[6][i] = i % 2 === 0 ? 1 : 0;
        pattern[i][6] = i % 2 === 0 ? 1 : 0;
      }

      let seed = 12345;
      const rand = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };

      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if ((i < 8 && j < 8) || (i < 8 && j >= size - 8) || (i >= size - 8 && j < 8)) continue;
          if (i === 6 || j === 6) continue;
          if (rand() > 0.5) pattern[i][j] = 1;
        }
      }

      return pattern;
    }

    function renderQR(container: HTMLElement | null, color: string, template: string) {
      if (!container) return;
      const pattern = generateQRPattern();
      const size = pattern.length;
      container.innerHTML = '';
      container.style.display = 'grid';
      container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
      container.style.gridTemplateRows = `repeat(${size}, 1fr)`;
      container.style.gap = '0';

      let borderRadius = '0';
      if (template === 'rounded') borderRadius = '30%';
      if (template === 'dot') borderRadius = '50%';

      const frag = document.createDocumentFragment();
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const cell = document.createElement('div');
          cell.className = 'qr-cell';
          if (pattern[i][j] === 1) {
            cell.style.background = color;
            cell.style.borderRadius = borderRadius;
          }
          frag.appendChild(cell);
        }
      }
      container.appendChild(frag);
    }

    // === QR Designer state ===
    let qrColor = '#F97316';
    let qrTemplate = 'square';
    let qrBg = '#FFF7ED';
    let qrBgDark = false;
    let restaurantName = 'Warung Bu Tini';

    function updatePreview() {
      renderQR(document.getElementById('preview-qr'), qrColor, qrTemplate);
      const card = document.getElementById('preview-card');
      if (card) card.style.background = qrBg;

      const name = document.getElementById('preview-name');
      if (name && card) {
        const subtitle = card.querySelectorAll('.text-neutral-400, .text-neutral-500');

        if (qrBgDark) {
          name.style.color = '#FFF7ED';
          subtitle.forEach(el => {
            if (el.tagName !== 'BUTTON') {
              el.classList.remove('text-neutral-400', 'text-neutral-500');
              el.classList.add('text-orange-100/50');
            }
          });
        } else {
          name.style.color = '#1C1410';
          subtitle.forEach(el => {
            if (el.tagName !== 'BUTTON') {
              el.classList.add('text-neutral-400', 'text-neutral-500');
              el.classList.remove('text-orange-100/50');
            }
          });
        }

        name.textContent = restaurantName || 'Warung Bu Tini';
      }
    }

    renderQR(document.getElementById('hero-qr'), '#0C0A09', 'square');
    updatePreview();

    document.querySelectorAll('#color-picker .color-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#color-picker .color-swatch').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        qrColor = (btn as HTMLElement).dataset.color || '#F97316';
        updatePreview();
      });
    });

    document.querySelectorAll('#template-picker .template-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#template-picker .template-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        qrTemplate = (btn as HTMLElement).dataset.template || 'square';
        updatePreview();
      });
    });

    document.querySelectorAll('#bg-picker .color-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#bg-picker .color-swatch').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        qrBg = (btn as HTMLElement).dataset.bg || '#FFF7ED';
        qrBgDark = (btn as HTMLElement).dataset.dark === 'true';
        updatePreview();
      });
    });

    const restaurantInput = document.getElementById('restaurant-name');
    restaurantInput?.addEventListener('input', (e) => {
      restaurantName = (e.target as HTMLInputElement).value;
      updatePreview();
    });

    // === Smooth scroll ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const offset = 80;
          const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });

    // === Close modal on Escape key ===
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => {
          m.classList.remove('active');
          document.body.style.overflow = '';
        });
      }
    });
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div ref={containerRef} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </>
  );
}
