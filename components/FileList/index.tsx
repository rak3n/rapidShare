import React from 'react';
import { database, storage } from '../../firebase';
import { ref as databaseRef, onValue } from 'firebase/database';
import { deleteObject, getDownloadURL, list, listAll, ref as storageRef } from 'firebase/storage';

import { Avatar, Button, Flex, Text, UnorderedList } from '@chakra-ui/react';


const FileList = () => {
    const [fileList, setFilesList] = React.useState<any[]>([]);

    const download = (url: string, filename: string) => {
        window.open(url, '_blank')
    }

    const getUploadedFileList = () => {
        if (!fileList.length)
            return (
                <Flex alignItems='center' w='100%' pl={6} pr={6} pb={4}>
                    <Text m='auto'>Waiting to list uploaded items</Text>
                </Flex>);
        return fileList.map((fileItem: any, index: number) => {
            return <Flex alignItems='center' key={`${fileItem.name}-${index}`} w='100%' pl={4} pr={4} pb={4}>
                <Avatar size={'sm'} mr={8} name={fileItem.filename}></Avatar>
                <Text w='100%' overflow='hidden'>{fileItem.filename}</Text>
                <Button w='max-content' onClick={() => download(fileItem.downloadURL, fileItem.filename)}>Open</Button>
            </Flex>
        })
    }

    React.useEffect(
        () => {
            onValue(databaseRef(database, '/lastUploaded'), async (snapshot: any) => {
                try {
                    const files = await listAll(storageRef(storage, 'files'));
                    let shouldDeleteItems = false;
                    const lastUploadTime: any = new Date(snapshot.val() || '');
                    const currentTime: any = new Date();
                    if ((currentTime - lastUploadTime) > 7200000)
                        shouldDeleteItems = true;
                        const allFiles = Array.from(files.items).map(async (fileRef: any) => {
                            if(shouldDeleteItems){
                                deleteObject(storageRef(storage, `files/${fileRef.name}`));
                            }
                            const downloadURL = await getDownloadURL(fileRef);
                            const filename = fileRef.name;
                            return {
                                filename,
                                downloadURL,
                            }
                        });
                        if(!shouldDeleteItems)
                        Promise.all(allFiles).then((data: any) => {
                            setFilesList(data);
                        });
                } catch (err) {
                    console.log(err);
                }
            });
        }, []);

    return <UnorderedList w='100%'>{getUploadedFileList()}</UnorderedList>;
};

export default FileList;