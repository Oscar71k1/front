import { useState } from "react";
import { FiUpload } from "react-icons/fi";
import Image from "next/image";

export async function getStaticProps() {
    const res = await fetch("https://3523110017-oscar5a-backend.cachos-company.shop/imagenes/all");
    const data = await res.json();

    const images = data.images
        .map(image => image.variants?.find(url => url.includes("/public")))
        .filter(Boolean);

    return { props: { images } };
}

export default function UploadForm({ images }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);

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
            const response = await fetch("https://3523110017-oscar5a-backend.cachos-company.shop/imagenes/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Error al subir la imagen");

            setFile(null);
            setPreview(null);
        } catch (error) {
            setError("Error al subir la imagen.");
            console.error(error);
        }
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
                {preview && <Image src={preview} alt="Vista previa" width={250} height={250} className="preview-image" />}
                <button onClick={handleUpload} className="upload-button">Subir Imagen</button>
                {error && <p className="error-text">{error}</p>}
            </div>

            <h3>Imágenes Subidas desde Cloudflare</h3>
            <div className="image-gallery">
                {images.length > 0 ? (
                    images.map((image, index) => (
                        <div key={index} className="image-card">
                            <Image src={image} alt={`Imagen ${index + 1}`} width={250} height={250} className="image-thumbnail" />
                        </div>
                    ))
                ) : (
                    <p>No hay imágenes subidas.</p>
                )}
            </div>
        </div>
    );
}

