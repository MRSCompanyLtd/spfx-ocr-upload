import * as React from 'react';
import styles from './UploadWithOcr.module.scss';
import { IUploadWithOcrProps } from './IUploadWithOcrProps';
import { Icon, Label, Text } from 'office-ui-fabric-react';
import { createWorker } from 'tesseract.js';
import Upload from './Upload';
import useLibraries from '../hooks/useLibraries';

const UploadWithOcr: React.FC<IUploadWithOcrProps> = ({ title, sp }) => {
  const [dragActive, setDragActive] = React.useState<boolean>(false);
  const [uploading, setUploading] = React.useState<boolean>(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>();

  const ref = React.useRef();
  const inputRef = React.useRef();

  const { uploadDocument } = useLibraries({ sp });

  React.useEffect(() => {
    const dropArea: any = ref.current;
    const input: any = inputRef.current;

    input.addEventListener('click', handleInput);
    dropArea.addEventListener('drop', handleDrop);
    dropArea.addEventListener('dragenter', handleDrag);

    return () => {
      input.removeEventListener('click', handleInput);
      dropArea.removeEventListener('drop', handleDrop);
      dropArea.removeEventListener('dragenter', handleDrag);
    }
  }, []);

  function handleDrag(e: React.DragEvent): void {
      e.preventDefault();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else {
      setDragActive(false)
    }
  }
  
  function handleDrop(e: React.DragEvent): void {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>): void {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  }

  function handleClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
    const input: any = inputRef.current;

    if (input) {
      input.click();
    }
  }

  async function handleUpload(fileName: string, lib: string): Promise<void> {
    setUploading(true);
    try {
      const worker = createWorker();
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      await worker.recognize(selectedFile);
      const { data } = await (worker as any).getPDF(`${selectedFile.name}`);
      // const blob = new Blob([new Uint8Array(data)], { type: 'application/pdf' });
      const file = new File([new Uint8Array(data)], fileName, { type: 'application/pdf' });
      await uploadDocument(file, lib);
      // const a = document.createElement('a');
      // a.href = URL.createObjectURL(blob);
      // a.target = '_blank noreferrer';
      // a.addEventListener('click', (e) => {
      //   setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
      // });
      // a.click();
    }
    catch(e) {
      console.log(e);
    }
    setUploading(false);
  }

  return (
    <section className={styles.uploadWithOcr}>
          <Text as="h1" className={styles.title}>
            {title}
          </Text>
          <div className={styles.mainZone}>
            <input ref={inputRef} onChange={handleInput} type="file" id='file' hidden />
            <div ref={ref}
              onClick={handleClick}
              className={`${styles.dropZone} ${dragActive && styles.dragActive}`}
              onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={() => setDragActive(false)} onDrop={handleDrop}>
                <Label style={{ pointerEvents: 'none' }}>
                  Drop a file
                </Label>
                <Icon
                  iconName='CloudUpload'
                  style={{ fontSize: '32px', margin: '8px 0', pointerEvents: 'none' }}
                  title='Upload'
                  ariaLabel='Upload document'
                />
                {selectedFile &&
                <Label style={{ pointerEvents: 'none' }}>
                  {selectedFile.name}
                </Label>
                }
          </div>
        </div>
        <div className={styles.submit}>
          <Upload sp={sp} submit={handleUpload} hidden={!selectedFile} />
        </div>
    </section>
  );
}

export default UploadWithOcr;
