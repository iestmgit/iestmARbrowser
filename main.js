import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// ---------- تنظیمات صحنه ----------
const container = document.getElementById('canvasContainer');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0b1a);

// ---------- دوربین ----------
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 2, 8);

// ---------- رندر ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// ---------- کنترلر ----------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = false;
controls.target.set(0, 1.5, 0);

// ---------- نورپردازی ----------
const ambientLight = new THREE.AmbientLight(0x404060);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(2, 5, 3);
scene.add(dirLight);

// ---------- زمین ----------
const gridHelper = new THREE.GridHelper(10, 20, 0x6c5ce7, 0x333366);
gridHelper.position.y = -0.5;
scene.add(gridHelper);

// ---------- ایجاد یک Canvas برای رندر کردن وب‌سایت ----------
// این Canvas رو به عنوان تکسچر به صفحه سه‌بعدی می‌دیم
const canvas2D = document.createElement('canvas');
canvas2D.width = 1024;
canvas2D.height = 768;
const ctx = canvas2D.getContext('2d');

// یک تکسچر از Canvas می‌سازیم که به‌روزرسانی میشه
const texture = new THREE.CanvasTexture(canvas2D);
texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.LinearFilter;

// ---------- ساخت صفحه نمایش سه‌بعدی ----------
const screenMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    emissive: new THREE.Color(0x6c5ce7),
    emissiveIntensity: 0.05,
    roughness: 0.3,
    metalness: 0.1,
    side: THREE.DoubleSide,
});

const screenGeometry = new THREE.PlaneGeometry(4, 3);
const screen = new THREE.Mesh(screenGeometry, screenMaterial);
screen.position.set(0, 1.5, 0);
scene.add(screen);

// ---------- فریم دور صفحه ----------
const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a4a,
    emissive: 0x6c5ce7,
    emissiveIntensity: 0.05,
    roughness: 0.5,
    metalness: 0.3,
});

const frameGeometry = new THREE.BoxGeometry(4.4, 3.4, 0.15);
const frame = new THREE.Mesh(frameGeometry, frameMaterial);
frame.position.set(0, 1.5, -0.1);
scene.add(frame);

// ---------- تابع نمایش وب‌سایت در Canvas ----------
function loadWebsiteOnScreen(url) {
    // نمایش پیام در حال بارگذاری
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(0, 0, canvas2D.width, canvas2D.height);
    ctx.fillStyle = '#6c5ce7';
    ctx.font = 'bold 40px Tahoma';
    ctx.textAlign = 'center';
    ctx.fillText('⏳ در حال بارگذاری...', canvas2D.width / 2, canvas2D.height / 2 - 20);
    ctx.font = '20px Tahoma';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(url, canvas2D.width / 2, canvas2D.height / 2 + 50);
    texture.needsUpdate = true;

    // ایجاد iframe مخفی
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = canvas2D.width + 'px';
    iframe.style.height = canvas2D.height + 'px';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.border = 'none';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

    // وقتی iframe بارگذاری شد
    iframe.onload = () => {
        try {
            // رسم iframe روی Canvas
            ctx.drawImage(iframe, 0, 0, canvas2D.width, canvas2D.height);
            texture.needsUpdate = true;
            console.log('✅ صفحه با موفقیت بارگذاری شد:', url);
            
            // آپدیت کردن هر ثانیه برای صفحات پویا
            setInterval(() => {
                try {
                    ctx.drawImage(iframe, 0, 0, canvas2D.width, canvas2D.height);
                    texture.needsUpdate = true;
                } catch (e) {
                    console.log('⏳ در حال بروزرسانی...');
                }
            }, 1000);
            
        } catch (error) {
            console.error('❌ خطا در نمایش صفحه:', error);
            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 30px Tahoma';
            ctx.textAlign = 'center';
            ctx.fillText('❌ خطا در بارگذاری', canvas2D.width / 2, canvas2D.height / 2);
            texture.needsUpdate = true;
        }
    };

    // اگر iframe بارگذاری نشد
    iframe.onerror = () => {
        ctx.fillStyle = '#ffaa44';
        ctx.font = 'bold 30px Tahoma';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ سایت قابل دسترسی نیست', canvas2D.width / 2, canvas2D.height / 2);
        texture.needsUpdate = true;
    };
}

// ---------- حلقه انیمیشن ----------
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// ---------- ریسایز ----------
window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
});

// ---------- دکمه‌ها ----------
document.getElementById('goBtn').addEventListener('click', () => {
    const url = document.getElementById('urlInput').value.trim();
    if (url) {
        // اگر کاربر http:// یا https:// رو نزده بود، اضافه کن
        let finalUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            finalUrl = 'https://' + url;
        }
        loadWebsiteOnScreen(finalUrl);
    } else {
        alert('لطفاً یک آدرس وارد کنید!');
    }
});

// Enter Key
document.getElementById('urlInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('goBtn').click();
    }
});

// ---------- دکمه AR (برای آینده) ----------
document.getElementById('arBtn').addEventListener('click', () => {
    alert('🌍 حالت واقعیت افزوده (AR) به‌زودی اضافه می‌شود!');
});

// ---------- بارگذاری پیش‌فرض یک سایت نمونه ----------
setTimeout(() => {
    loadWebsiteOnScreen('https://threejs.org');
}, 500);

console.log('🚀 IESTM AR Browser Loaded Successfully!');
