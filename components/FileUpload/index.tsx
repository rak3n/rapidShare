import React from 'react';
import {database, storage} from '../../firebase/index';
import { ref, uploadBytesResumable} from 'firebase/storage';
import {ref as databaseRef, set, update } from 'firebase/database';
import { Button, Flex, Text, Tooltip, Alert, CircularProgress, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, UnorderedList, AlertIcon } from '@chakra-ui/react';



// drag drop file component
const DragDropFile = () => {
    // drag state
    const [dragActive, setDragActive] = React.useState<boolean>(false);
    const [fileUploadInfo, setFileUploadInfo] = React.useState<any[]>([]);
    const [fileSelectedToUpload, setFileSelectedToUpload] = React.useState<boolean>(false);
    const [allUploaded, setAllUploaded] = React.useState<boolean>(false);
    // ref
    const inputRef = React.useRef<any>(null);
    
    
    const handleFile = (files:any[]) => {
        if(files && files.length){
            setFileSelectedToUpload(true);
            setAllUploaded(false);
            const filesArray = Array.from(files);
            setFileUploadInfo(filesArray);
            filesArray.forEach(async (file:any, index:number)=>{
                const storageRef = ref(storage, `/files/${file.name}`);
                const upload = uploadBytesResumable(storageRef, file);   
                upload.on('state_changed',(snapshot:any)=>{
                    const percent = Math.round(
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    );
                    setFileUploadInfo((oldFiles:any[])=>{
                        const temp=[...oldFiles];
                        temp[index] = {
                            file,
                            percent,
                        };
                        return temp;
                    });
                }, (err:any) => {
                    setFileUploadInfo((oldFiles:any[])=>{
                        const temp=[...oldFiles];
                        temp[index] = {
                            file,
                            errorMessage:err.message,
                        };
                        return temp;
                    });
                },    
                ()=>{
                  update(databaseRef(database,'/'),{
                    lastUploaded: new Date(),
                  });
                }
            );
        });
      }
    };
    // handle drag events
    const handleDrag = function(e:any) {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };
    
    // triggers when file is dropped
    const handleDrop = function(e:any) {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files);
      }
    };
    
    // triggers when file is selected with click
    const handleChange = function(e:any) {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files);
      }
    };

    React.useEffect(()=>{
        if(fileUploadInfo.length){
        const allClear = fileUploadInfo.every((file:any)=>{
            if(file.errorMessage) return false;
            if(file.percent<100) return false;
            return true;
        });

        if(allClear){
            setAllUploaded(true);
        }
    }
    },[fileUploadInfo]);
    
  // triggers the input when the button is clicked
    const onButtonClick = () => {
      inputRef.current.click();
    };

    const getFileUploadList=()=>{
        const JSX:any[]=[];
        fileUploadInfo.forEach((file:any)=>{
            JSX.push(
                <UnorderedList>
                    <ListItem>
                        <Flex alignItems='center' w='100%' minW={70}>
                            <Text w='90%'>{file?.file?.name || 'file name'}</Text>
                            {
                                file.errorMessage?
                                <Tooltip label={`upload Error: ${file.errorMessage}`}>
                                <Alert w='10%' background='white' status='error'><AlertIcon/></Alert>
                                </Tooltip>
                                :file.percent<100?
                                <CircularProgress w='10%' size={6} value={file.percent} />
                                :
                                <Tooltip label='file has been uploaded'>
                                <Alert w='10%' background='white' status='success'><AlertIcon/></Alert>
                                </Tooltip>
                            }
                        </Flex>
                    </ListItem>
                </UnorderedList>
            );
        });
        return JSX;
    }

    return (
        <>
      <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
        <input ref={inputRef} type="file" id="input-file-upload" multiple={true} onChange={handleChange} />
        <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : "" }>
          <div>
            <p>Drag and drop your file here or</p>
            <button className="upload-button" onClick={onButtonClick}>Upload a file</button>
          </div> 
        </label>
        { dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div> }
      </form>
      
      <Modal isOpen={fileSelectedToUpload} onClose={()=>allUploaded?setFileSelectedToUpload(false):null}>
          <ModalOverlay/>
          <ModalContent>
          <ModalHeader>File Upload Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {getFileUploadList()}
          </ModalBody>

          <ModalFooter>
            <Button disabled={!allUploaded} colorScheme='blue' onClick={()=>setFileSelectedToUpload(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      </>
    );
  };

export default DragDropFile;