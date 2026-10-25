// Hamburger Menu Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close menu when clicking on a nav link (for mobile)
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form submission (basic handling)
const reservationForm = document.querySelector('.reservation-form');
reservationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // In a real application, you would send this data to a server
    alert('Thank you for your reservation! We will contact you soon.');
    reservationForm.reset();
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// 3D reveal: sections flip up into place as they scroll into view
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

if (!prefersReducedMotion) {
    document.querySelectorAll('section:not(.hero)').forEach(section => {
        section.classList.add('reveal-3d');
        observer.observe(section);
    });
}

// 3D tilt on hover for the hero image and cards
if (canHover && !prefersReducedMotion) {
    document.querySelectorAll('.menu-item, .chef-card, .testimonial-card').forEach(card => {
        card.classList.add('tilt-3d');
    });

    document.querySelectorAll('.tilt-3d').forEach(el => {
        const maxTilt = el.classList.contains('hero-image') ? 8 : 12;
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            el.style.transform = `perspective(900px) rotateX(${-y * maxTilt}deg) rotateY(${x * maxTilt}deg) scale(1.02)`;
            el.style.setProperty('--glare-x', `${(x + 0.5) * 100}%`);
            el.style.setProperty('--glare-y', `${(y + 0.5) * 100}%`);
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });
}

// Three.js hero scene: floating gold shapes and particles with mouse parallax
function initHero3D() {
    const canvas = document.getElementById('hero-3d');
    if (!canvas || typeof THREE === 'undefined') return;

    const hero = canvas.parentElement;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 12;

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const keyLight = new THREE.PointLight(0xffd700, 1.4, 50);
    keyLight.position.set(5, 5, 8);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xff8c42, 0.8, 50);
    rimLight.position.set(-6, -4, 4);
    scene.add(rimLight);

    const gold = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.85, roughness: 0.25 });
    const wireGold = new THREE.MeshBasicMaterial({ color: 0xffd700, wireframe: true, transparent: true, opacity: 0.25 });

    const shapes = [
        { geo: new THREE.TorusGeometry(1.1, 0.12, 24, 80), mat: gold, pos: [-6, 2.5, -2] },
        { geo: new THREE.IcosahedronGeometry(0.9, 0), mat: gold, pos: [-3.5, -3, 0] },
        { geo: new THREE.TorusKnotGeometry(0.7, 0.18, 120, 16), mat: gold, pos: [6.5, -2.5, -3] },
        { geo: new THREE.OctahedronGeometry(0.7, 0), mat: gold, pos: [1, 3.8, -4] },
        { geo: new THREE.IcosahedronGeometry(2.2, 1), mat: wireGold, pos: [7, 3, -6] },
        { geo: new THREE.TorusGeometry(2, 0.02, 8, 100), mat: wireGold, pos: [-7, -2, -5] }
    ].map(({ geo, mat, pos }, i) => {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...pos);
        mesh.userData = { baseY: pos[1], speed: 0.3 + i * 0.07, phase: i * 1.3 };
        scene.add(mesh);
        return mesh;
    });

    const particleCount = 350;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 30;
        positions[i + 1] = (Math.random() - 0.5) * 18;
        positions[i + 2] = (Math.random() - 0.5) * 14 - 4;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({
        color: 0xffd700, size: 0.06, transparent: true, opacity: 0.7
    }));
    scene.add(particles);

    const mouse = { x: 0, y: 0 };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX / window.innerWidth - 0.5;
        mouse.y = e.clientY / window.innerHeight - 0.5;
    });

    function resize() {
        const w = hero.clientWidth;
        const h = hero.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    // Pause rendering while the hero is off screen
    let visible = true;
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(hero);

    const clock = new THREE.Clock();
    function render() {
        const t = clock.getElapsedTime();
        shapes.forEach(mesh => {
            const { baseY, speed, phase } = mesh.userData;
            mesh.rotation.x = t * speed;
            mesh.rotation.y = t * speed * 0.8;
            mesh.position.y = baseY + Math.sin(t * speed + phase) * 0.4;
        });
        particles.rotation.y = t * 0.02;
        camera.position.x += (mouse.x * 2 - camera.position.x) * 0.05;
        camera.position.y += (-mouse.y * 2 - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
    }

    if (prefersReducedMotion) {
        render();
        return;
    }

    (function loop() {
        requestAnimationFrame(loop);
        if (visible) render();
    })();
}

initHero3D();
