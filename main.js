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

// ---------- کنترلر برای چرخش ----------
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

const fillLight = new THREE.DirectionalLight(0x6c5ce7, 0.5);
fillLight.position.set(-2, 1, 4);
scene.add(fillLight);

// ---------- زمین (برای زیبایی) ----------
const gridHelper = new THREE.GridHelper(10, 20, 0x6c5ce7, 0x333366);
gridHelper.position.y = -0.5;
scene.add(gridHelper);

// ---------- نمایشگر سه‌بعدی (همان صفحه وب) ----------
// ما از یک ویدیوی جعلی استفاده می‌کنیم که بعداً با iframe واقعی جایگزین می‌شه
const textureLoader = new THREE.TextureLoader();
const placeholderTexture = textureLoader.load('https://via.placeholder.com/1024x768/1a1a2a/6c5ce7?text=IESTM+AR+Browser');

const screenMaterial = new THREE.MeshStandardMaterial({
    map: placeholderTexture,
    emissive: new THREE.Color(0x6c5ce7),
    emissiveIntensity: 0.1,
    roughness: 0.3,
    metalness: 0.1,
    side: THREE.DoubleSide,
});

const screenGeometry = new THREE.PlaneGeometry(4, 3);
const screen = new THREE.Mesh(screenGeometry, screenMaterial);
screen.position.set(0, 1.5, 0);
scene.add(screen);

// ---------- فریم یا قاب دور صفحه (برای زیبایی) ----------
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
    const url = document.getElementById('urlInput').value;
    if (url) {
        // اینجا باید صفحه وب رو در iframe بارگذاری کنیم و به‌عنوان تکسچر روی صفحه بذاریم
        console.log('🌐 بارگذاری:', url);
        alert('در حال حاضر فقط حالت نمایشی فعال است. به‌زودی اتصال واقعی اضافه می‌شود!');
        // بعداً: رندر کردن iframe به عنوان تکسچر
    }
});

document.getElementById('arBtn').addEventListener('click', () => {
    alert('🌍 حالت واقعیت افزوده (AR) به‌زودی اضافه می‌شود!');
});

// ---------- پیام خوش‌آمدگویی ----------
console.log('🚀 IESTM AR Browser Loaded Successfully!');
// این تابع رو به main.js اضافه کنید
function loadWebsiteOnScreen(url) {
    // یک iframe مخفی بسازید
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '1024px';
    iframe.style.height = '768px';
    iframe.style.position = 'absolute';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

    // بعد از بارگذاری، از iframe عکس بگیرید و به تکسچر تبدیل کنید
    iframe.onload = () => {
        // اینجا باید از iframe عکس بگیرید و به تکسچر سه‌بعدی بدید
        // ولی به خاطر محدودیت CORS، این روش فقط برای سایت‌های خاص کار می‌کنه
        console.log('✅ صفحه بارگذاری شد:', url);
    };
}
