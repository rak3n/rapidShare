import { Flex, Text } from '@chakra-ui/react';
import type { NextPage } from 'next';
import DragDropFile from '../components/FileUpload';
import FileList from '../components/FileList';

const Home: NextPage = () => {

  return (
    <Flex direction='column' h='100vh' w='100vw' alignItems='center' justifyContent='center' p={12}>
      <Flex background='white' align={'center'} justifyContent='center' h='10%' w='100%' mt={-12}>
        <Text fontSize='3xl' fontWeight='bold'>rapidShare🚀</Text>
      </Flex>
      <Flex background='gray.100' rounded={4} h='25%' w='100%'>
        <DragDropFile/>
      </Flex>
      <Flex background='white' h='65%' w='100%' mt={10} overflowY='auto'>
        <FileList/>
      </Flex>
    </Flex>
  )
}

export default Home
