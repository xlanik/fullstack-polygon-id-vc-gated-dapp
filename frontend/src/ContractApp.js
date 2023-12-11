import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
//import * as ElectionArtifact from './abi/Election.sol/Election.json'; // Update the path if necessary
import {
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Select,
  Text,
  VStack,
  Spinner,
  useToast,
  Box
} from '@chakra-ui/react';

const ElectionApp = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => { 
    const init = async () => {
      
      if (window.ethereum) {
        console.log(window.ethereum)
        try {
          //const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = new ethers.Contract(
            //ElectionArtifact.networks[window.ethereum.networkVersion].address,
            //ElectionArtifact.abi,
            provider.getSigner()
          );
          console.log(window.ethereum)
          setProvider(provider);
          setContract(contract);
          const accounts = await provider.listAccounts();
          setAccount(accounts[0]);

          contract.on('votedEvent', () => {
            // This is where you can handle the event
            loadCandidates(); // Reload candidates when a vote is cast
          });

          loadCandidates();
        } catch (error) {
          console.error('Error initializing app:', error);
          toast({
            title: 'Error',
            description: 'Could not initialize the dApp.',
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
        }
      } else {
        alert('Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!');
      }
    };

    init();
  }, [toast]);

  const loadCandidates = async () => {
    if (!contract) return;
    try {
      const candidatesCount = await contract.candidatesCount();

      const candidatesPromises = [];
      for (let i = 1; i <= candidatesCount; i++) {
        candidatesPromises.push(contract.candidates(i));
      }

      const candidates = await Promise.all(candidatesPromises);
      setCandidates(candidates.map(candidate => ({
        id: candidate.id.toString(),
        name: candidate.name,
        voteCount: candidate.voteCount.toString()
      })));

      setLoading(false);
    } catch (error) {
      console.error('Error loading candidates:', error);
    }
  };

  const castVote = async () => {
    if (!contract || !selectedCandidate) return;

    setLoading(true);
    try {
      const transaction = await contract.vote(selectedCandidate);
      await transaction.wait();
      loadCandidates();
      toast({
        title: 'Vote Cast',
        description: `You voted for candidate ${selectedCandidate}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error casting vote:', error);
      toast({
        title: 'Error',
        description: 'There was an error casting your vote.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.md" centerContent>
      {loading ? (
        <Spinner />
      ) : (
        <VStack spacing={4} marginY={4}>
          <Heading>Election Results</Heading>
          <Table>
            <Thead>
              <Tr>
                <Th>#</Th>
                <Th>Name</Th>
                <Th>Votes</Th>
              </Tr>
            </Thead>
            <Tbody>
              {candidates.map((candidate) => (
                <Tr key={candidate.id}>
                  <Td>{candidate.id}</Td>
                  <Td>{candidate.name}</Td>
                  <Td>{candidate.voteCount}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Select
            placeholder="Select candidate"
            onChange={(e) => setSelectedCandidate(e.target.value)}
            value={selectedCandidate}
          >
            {candidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name}
              </option>
            ))}
          </Select>
          <Button colorScheme="blue" onClick={castVote} isDisabled={!selectedCandidate}>
            Vote
          </Button>
          {account && <Text>Your Account: {account}</Text>}
        </VStack>
      )}
    </Container>
  );
};

export default ElectionApp;
