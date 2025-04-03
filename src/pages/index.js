import { useState, useEffect } from "react";
import { FiUpload } from "react-icons/fi";

export default function UploadForm() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);
    const [images, setImages] = useState([]);
    const [expandedImage, setExpandedImage] = useState(null);
    const [selectedVariants, setSelectedVariants] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Selecciona una imagen antes de subir.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(" https://3523110017-oscar5a-backend.cachos-company.shop/imagenes/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Error al subir la imagen");
            }

            await fetchImages();
        } catch (error) {
            setError("Error al subir la imagen.");
            console.error(error);
        }
    };

    const fetchImages = async () => {
        try {
            const response = await fetch(" https://3523110017-oscar5a-backend.cachos-company.shop/imagenes/all");
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const data = await response.json();

            if (!data || !data.images || !Array.isArray(data.images)) {
                throw new Error("El backend no devolvió un array de imágenes.");
            }

            const imageUrls = data.images.map(image => {
                if (!image.variants || !Array.isArray(image.variants)) return null;

                const small = image.variants.find(url => url.includes("/public")) || null;
                const medium = image.variants.find(url => url.includes("/medio")) || null;
                const large = image.variants.find(url => url.includes("/big")) || null;

                return small || medium || large ? { small, medium, large } : null;
            }).filter(Boolean);

            setImages(imageUrls);
        } catch (error) {
            setError("Error al cargar las imágenes.");
            console.error("Error en fetchImages:", error);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleSelectImage = (image) => {
        setSelectedVariants(image);
        setExpandedImage(image.large);
    };

    const handleVariantClick = (variant) => {
        setExpandedImage(variant);
    };

    const handleCloseExpandedImage = () => {
        setExpandedImage(null);
    };

    return (
        <div className="upload-container">
            <h3>Sube una Imagen</h3>
            <div className="upload-form">
                <label htmlFor="file-upload" className="custom-file-upload">
                    <FiUpload className="upload-icon" /> Seleccionar Imagen
                </label>
                <input 
                    id="file-upload"
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden-file-input"
                />
                {preview && <img src={preview} alt="Vista previa" className="preview-image" />}
                <button onClick={handleUpload} className="upload-button">Subir Imagen</button>
                {error && <p className="error-text">{error}</p>}
            </div>

            <h3>Imágenes Subidas desde Cloudflare</h3>
            <div className="image-gallery">
                {images.length > 0 ? (
                    images.map((image, index) => (
                        <div key={index} className="image-card" onClick={() => handleSelectImage(image)}>
                            {image.small && <img src={image.small} alt={`Imagen ${index + 1}`} className="image-thumbnail" />}
                            <p>Seleccionar</p>
                        </div>
                    ))
                ) : (
                    <p>No hay imágenes subidas.</p>
                )}
            </div>

            {expandedImage && (
                <div className="expanded-image-container" onClick={handleCloseExpandedImage}>
                    <img src={expandedImage} alt="Imagen Expandida" className="expanded-image" />
                </div>
            )}

            {selectedVariants && (
                <div className="image-variants">
                    <h4>Resoluciones de imágenes:</h4>
                    <div className="variant-gallery">
                        {selectedVariants.small && (
                            <div className="variant" onClick={() => handleVariantClick(selectedVariants.small)}>
                                <img src={selectedVariants.small} alt="250px" className="variant-image" />
                                <span>250px</span>
                            </div>
                        )}
                        {selectedVariants.medium && (
                            <div className="variant" onClick={() => handleVariantClick(selectedVariants.medium)}>
                                <img src={selectedVariants.medium} alt="500px (Mediana)" className="variant-image" />
                                <span>500px</span>
                            </div>
                        )}
                        {selectedVariants.large && (
                            <div className="variant" onClick={() => handleVariantClick(selectedVariants.large)}>
                                <img src={selectedVariants.large} alt="750px (Grande)" className="variant-image" />
                                <span>750px</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
