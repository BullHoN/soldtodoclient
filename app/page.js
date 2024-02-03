"use client"
import { ethers } from 'ethers'
import { useState, useEffect } from 'react';
import { abi } from './TodoContract.json'

export default function Home() {

  const [state,setState] = useState({
    provider: null,
    signer: null,
    contract: null
  });

  const [username,setUsername] = useState('');
  const [todo,setTodo] = useState('');
  const [todos,setTodos] = useState([]);


  useEffect(()=>{
    const connectWallet = async ()=> {
      const contractAddress = "0xC500b50cFdbd86c388527d2f1E714173B3705837";
      const contractABI = abi;

      try{
        const {ethereum} = window;

        if(ethereum){
          const account = await ethereum.request({
            method: "eth_requestAccounts"
          })

          const provider = new ethers.providers.Web3Provider(window.ethereum)
          const signer = provider.getSigner();
          const contract = new ethers.Contract(contractAddress,contractABI,signer);
          
          contract.on("completedTodo",(name,evt)=>{
            console.log("someone completed todo",name,evt);
          })

          const todos = await contract.getAllTodos();
          setTodos(todos);
          console.log("all todos",todos);

          setState({provider,signer,contract});
        }
      }
      catch(err){
        console.log(err);
      }
      
    } 

    if(state.provider == null) connectWallet()


  },[])

  // // console.log(state);

  const registerUser = async (e)=>{
    e.preventDefault();

    const transaction = await state.contract.registerUser(username);
    await transaction.wait();

    console.log("user registered",transaction);

  }

  const addTodo = async (e)=>{
    e.preventDefault();

    const transaction = await state.contract.addTodo(todo);
    await transaction.wait();

    const todos = await state.contract.getAllTodos();
    setTodos(todos);
    console.log("all todos",todos);

    console.log("todo_added",transaction);
  }

  const markAsDone = async (id)=>{

    const transaction = await state.contract.completeTodo(id);
    await transaction.wait();

    const todos = await state.contract.getAllTodos();
    setTodos(todos);
    console.log("all todos",todos);

    console.log("marked as done",transaction);    
  }

  return (
    <div>
      <form>
        <input type='text' onChange={(e) => setUsername(e.target.value)} />
        <button onClick={registerUser}>Register</button>
      </form>

      <form>
        <input type='text' onChange={(e) => setTodo(e.target.value)} />
        <button onClick={addTodo}>Add Todo</button>
      </form>

      <div>
        {
          todos.map((curr,idx) => {
            // console.log(curr.isCompleted);
            return (
              <div key={idx}>
                <p>{idx} task: {curr.task} {(curr.isCompleted ? "completed" : "pending")}</p>
                <button onClick={() => markAsDone(curr.id)}>mark as done</button>
              </div>
            )
          })
        }
      </div>

    </div>
  );
}
