'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, Center, PerspectiveCamera, Html } from '@react-three/drei'
import * as THREE from 'three'
import './App.css'

function Model({ url, onProgress }) {
  const { scene } = useGLTF(url, (state) => {
    if (state.loading) {
      onProgress(state.progress);
    }
  });
  const modelRef = useRef();
  const { camera } = useThree();

  useEffect(() => {
    if (modelRef.current) {
      const box = new THREE.Box3().setFromObject(modelRef.current);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim; // Adjust scale to fit model within view
      modelRef.current.scale.setScalar(scale);

      const center = box.getCenter(new THREE.Vector3());
      modelRef.current.position.set(-center.x, -center.y, -center.z);

      const distance = maxDim * 2.5; // Adjust distance for better view
      camera.position.set(0, 0, distance);
      camera.lookAt(center);
      camera.updateProjectionMatrix();
    }
  }, [scene, camera]);

  return (
    <Center>
      <primitive ref={modelRef} object={scene} />
    </Center>
  );
}

export default function Component() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    fetch('https://immersive-commerce.vercel.app/api/models')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const categorizedProducts = data.map(product => ({
            ...product,
            category: assignCategory(product.name)
          }));
          setProducts(categorizedProducts);
          setFilteredProducts(categorizedProducts);
        } else {
          throw new Error('No products found in the API response');
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setError(error.message);
        setIsLoading(false);
      });
  }, []);

  const assignCategory = (productName) => {
    const streetProducts = ['Jacket', 'Fila', 'Nike'];
    const fashionProducts = ['Balenciaga', 'Bag', 'Dior'];
    
    if (streetProducts.some(name => productName.toLowerCase().includes(name.toLowerCase()))) {
      return 'street';
    } else if (fashionProducts.some(name => productName.toLowerCase().includes(name.toLowerCase()))) {
      return 'fashion';
    } else {
      return 'other';
    }
  };

  useEffect(() => {
    if (filter === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.category === filter));
    }
    setCurrentProductIndex(0);
  }, [filter, products]);

  const handleNextProduct = () => {
    setCurrentProductIndex((prevIndex) => (prevIndex + 1) % filteredProducts.length);
  };

  const handlePreviousProduct = () => {
    setCurrentProductIndex((prevIndex) => (prevIndex - 1 + filteredProducts.length) % filteredProducts.length);
  };

  if (isLoading) {
    return <div className="loading-screen">Loading products...</div>;
  }

  if (error) {
    return <div className="error-screen">Error: {error}</div>;
  }

  if (filteredProducts.length === 0) {
    return <div className="no-products-screen">No products available for the selected filter</div>;
  }

  const currentProduct = filteredProducts[currentProductIndex];

  return (
    <div className="container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          <svg className="h-full w-full flex-[0_0_auto]" viewBox="0 0 486 101" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M182.825 85.79c-8-.04-12.92-3.72-16.45-7.985l-.115 22.715-15.01-.075.345-68.73 15.01.075-.04 7.605c3.68-4.92 8.735-8.55 16.535-8.51 12.345.06 24.045 9.8 23.96 27.475v.195c-.095 17.68-11.695 27.3-24.235 27.235zm9.22-27.505c.045-8.79-5.85-14.645-12.865-14.68-7.01-.035-12.865 5.76-12.91 14.55v.195c-.045 8.79 5.755 14.645 12.765 14.68 7.01.035 12.965-5.665 13.01-14.55v-.195zm70.285 5.685l-36.835-.185c1.445 6.82 6.17 10.4 12.885 10.435 5.035.025 8.7-1.535 12.865-5.365L259.8 76.5c-4.97 6.1-12.1 9.815-21.675 9.765-15.9-.08-27.595-11.3-27.515-27.495v-.2c.075-15.11 10.9-27.5 26.31-27.42 17.675.09 25.705 13.855 25.63 28.865v.2c-.01 1.485-.115 2.37-.22 3.755zM236.86 43.2c-6.22-.03-10.29 4.39-11.51 11.2l22.615.115c-.86-6.72-4.785-11.28-11.105-11.315zm63.08 3.97c-9.975-.05-16.125 5.945-16.19 18.585l-.1 19.555-15.01-.075.265-52.93 15.01.075-.055 10.665c3.1-7.29 8.06-12.01 16.945-11.57l-.08 15.7-.785-.005z"></path><path fill="currentColor" d="M323.545 86.496c-7.405-.036-15.69-2.551-22.675-8.116l6.47-9.845c5.705 4.175 11.72 6.38 16.66 6.405 4.345.02 6.33-1.55 6.34-3.92v-.195c.015-3.26-5.115-4.37-10.93-6.18-7.395-2.21-15.77-5.71-15.72-15.98v-.195c.055-10.765 8.775-16.745 19.44-16.69 6.715.035 14.01 2.34 19.72 6.22l-5.78 10.34c-5.22-3.09-10.445-4.99-14.295-5.01-3.655-.02-5.54 1.55-5.55 3.625v.2c-.015 2.96 5.015 4.37 10.73 6.375 7.395 2.505 15.97 6.105 15.92 15.78v.195c-.06 11.76-8.875 17.05-20.33 16.99zm26.665-59.611l.065-13.33 15.8.08-.065 13.33-15.8-.08zm.1 58.76l.265-52.93 15.01.075-.265 52.93-15.01-.075zm62.415.315l.04-7.605c-3.68 4.92-8.735 8.545-16.535 8.51-12.345-.06-24.045-9.8-23.96-27.475v-.195c.09-17.675 11.69-27.295 24.235-27.235 8 .04 12.92 3.72 16.455 7.985l.13-26.07 15.01.075-.365 72.09-15.01-.08zm.33-26.565c.045-8.79-5.755-14.645-12.765-14.68-7.01-.035-12.965 5.665-13.01 14.55v.195c-.045 8.79 5.85 14.645 12.865 14.68 7.01.035 12.865-5.76 12.91-14.55v-.195zm72.455 5.695l-36.835-.185c1.445 6.82 6.17 10.4 12.885 10.435 5.035.025 8.7-1.535 12.865-5.365l8.555 7.645c-4.97 6.1-12.095 9.815-21.675 9.765-15.9-.08-27.595-11.3-27.515-27.495v-.2c.075-15.11 10.905-27.5 26.31-27.42 17.675.09 25.705 13.855 25.63 28.865v.2c-.01 1.485-.115 2.375-.22 3.755zm-25.47-20.765c-6.22-.03-10.295 4.39-11.51 11.2l22.615.115c-.86-6.72-4.785-11.285-11.105-11.315z"></path><path fill="currentColor" d="M128.09 31.595l-.15 29.525c-.035 7.11-3.71 10.745-9.435 10.715-5.73-.03-9.065-3.7-9.03-10.81l.08-15.5c-2.195.555-4.465.85-6.775.85-2.815 0-5.59-.435-8.235-1.26l-.105 20.57c-.06 12.145 6.52 19.685 17.875 19.74 7.605.04 12.07-3.99 15.545-8.415l-.04 7.505 15.01.075.265-52.93-15.005-.065z"></path><path fill="currentColor" d="M117.99 1.645L116.665.48H92.68l14.765 12.98a7.004 7.004 0 012.38 4.84 7.006 7.006 0 01-1.74 5.11 7.047 7.047 0 01-5.3 2.39 7.045 7.045 0 01-4.635-1.74L77.69 6.08A22.84 22.84 0 0062.695.475a22.889 22.889 0 00-17.2 7.765c-8.285 9.435-7.395 23.885 1.99 32.225L67.92 58.43a7.004 7.004 0 012.38 4.84 7.006 7.006 0 01-1.74 5.11 7.055 7.055 0 01-5.3 2.39 7.032 7.032 0 01-4.65-1.75L38.17 51.05c-4.51-3.92-10.52-5.95-16.48-5.565-6.1.39-11.68 3.135-15.72 7.73a22.829 22.829 0 00-5.645 16.58C.715 75.85 3.43 81.4 7.965 85.43l1.305 1.15h23.985L18.51 73.62a6.985 6.985 0 01-2.38-4.845 7.006 7.006 0 011.74-5.11 6.974 6.974 0 014.84-2.38c1.9-.12 3.71.51 5.115 1.74l20.44 17.97c3.91 3.405 8.93 5.385 14.155 5.585h1.765a22.962 22.962 0 0016.28-7.745c8.29-9.425 7.395-23.875-1.99-32.215L58.03 28.65a7.005 7.005 0 01-2.38-4.845 6.987 6.987 0 011.74-5.105 7.06 7.06 0 019.95-.645l20.44 17.97h.005c4.155 3.61 9.48 5.6 14.995 5.6 6.595 0 12.865-2.83 17.205-7.765a22.85 22.85 0 005.685-15.095 22.93 22.93 0 00-7.68-17.12z"></path></svg>
        </div>       
        <div className="sidebar-logo">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <path d="M42.741 71.477c-9.881 11.604-19.355 25.994-19.45 36.75-.037 4.047 1.255 7.58 4.354 10.256 4.46 3.854 9.374 5.213 14.264 5.221 7.146.01 14.242-2.873 19.798-5.096 9.357-3.742 112.79-48.659 112.79-48.659.998-.5.811-1.123-.438-.812-.504.126-112.603 30.505-112.603 30.505a24.771 24.771 0 0 1-6.524.934c-8.615.051-16.281-4.731-16.219-14.808.024-3.943 1.231-8.698 4.028-14.291z" fill="white"/>
</svg>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="data-badge">Data: convertcsv.csv</div>
        </header>

        {/* Product viewer */}
        <div className="product-viewer">
          <h2 className="viewer-title">Based user profiles provided in the data, here are some example products</h2>
          <div className="filter-wrapper">
            <label htmlFor="filter" className="filter-label">Filter:</label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-dropdown"
            >
              <option value="all">All</option>
              <option value="street">Street</option>
              <option value="fashion">Fashion</option>
            </select>
          </div>
          <div className="canvas-wrapper">
            <Canvas style={{ width: '100%', height: '100%' }}>
              <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={85} />
              <ambientLight intensity={1.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
              <pointLight position={[-10, -10, -10]} />
              <Suspense fallback={
                <Html center>
                  <div style={{ color: 'black', fontSize: '1em' }}>
                    <p>Loading... {Math.round(loadingProgress * 100)}%</p>
                  </div>
                </Html>
              }>
                {currentProduct && currentProduct.glbUrl ? (
                  <Model url={currentProduct.glbUrl} onProgress={setLoadingProgress} /> 
                ) : (
                  <Center>
                    <mesh>
                      <boxGeometry args={[1, 1, 1]} />
                    </mesh>
                  </Center>
                )}
              </Suspense>
              <OrbitControls target={[0, 0, 0]} />
            </Canvas>
          </div>
          <div className="product-nav">
            <button onClick={handlePreviousProduct} className="nav-button">Previous</button>
            <div className="product-info">
              <p className="product-name">{currentProduct.name}</p>
              <p className="product-counter">({currentProductIndex + 1}/{filteredProducts.length})</p>
            </div>
            <button onClick={handleNextProduct} className="nav-button">Next</button>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          *example data is based on what we've received the data will most likely change based on users shopping habits
        </footer>
      </div>
    </div>
  );
}
