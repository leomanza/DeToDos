import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";
import { Web3Storage } from "web3.storage";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [todo, setTodo] = useState("");
  const [title, setTitle] = useState(null);
  const [cid, setCid] = useState(null);
  const [cidurl, setcidurl] = useState(null);
  const getStorageClient = () => {
    return new Web3Storage({
      token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN,
    });
  };
  const makeGatewayURL = (cid, path) => {
    return `https://${cid}.ipfs.dweb.link/${encodeURIComponent(path)}`;
  };
  const getCidUrl = async (cid) => {
    const res = await getStorageClient().get(cid);
    const files = await res.files();
    return makeGatewayURL(cid, files[0].name);
  };

  const getDataFromCid = async (cid) => {
    const url = await getCidUrl(cid);
    setcidurl(url);
    const urlData = await fetch(url);
    if (!urlData.ok) {
      throw new Error("error fetching todo data");
    }
    const fileData = await urlData.json();
    return fileData;
  };

  let addTodo = async (event) => {
    setLoading(true);
    event.preventDefault();
    const storageClient = getStorageClient();
    let newData = {};
    let vaultName;
    let vaultOwner;
    if (!cid) {
      let vaultName = title;
      // Todo:
      let vaultOwner = "";
      newData = {
        name: vaultName,
        owner: vaultOwner,
        items: [{ text: todo, completed: false }],
      };
    } else {
      const currentData = await getDataFromCid(cid);
      const items = currentData.items;
      items.push({ text: todo, completed: false });
      vaultName = currentData.name;
      vaultOwner = currentData.owner;
      newData = {
        ...currentData,
        items: items,
      };
    }

    const file = new File(
      [`${JSON.stringify(newData)}`],
      `${vaultName}-${vaultOwner}-v${new Date().getTime()}.json`,
      {
        type: "apllication/json",
      }
    );

    const newcid = await storageClient.put([file]);
    setcidurl(await getCidUrl(newcid));
    setData(newData);
    setLoading(false);
    setCid(newcid);
  };

  const removeTodo = async (todoItem) => {
    setLoading(true);
    const updateItem = { text: todoItem.text, completed: true };
    const newItems = data.items;
    const newData = {
      ...data,
      items: [...data.items.filter((e) => e !== todoItem), updateItem],
    };
    const file = new File(
      [`${JSON.stringify(newData)}`],
      `${data.vaultName}-${data.vaultOwner}-v${new Date().getTime()}.json`,
      {
        type: "apllication/json",
      }
    );

    const newcid = await getStorageClient().put([file]);
    setcidurl(await getCidUrl(newcid));
    setData(newData);
    setLoading(false);
    setCid(newcid);
  };

  const loadTodos = async (cid) => {
    const data = await getDataFromCid(cid);
    setData(data);
    setTitle(data.name);
    setLoading(false);
  };

  useEffect(() => {
    if (router.query.cid) {
      setCid(router.query.cid);
      setLoading(true);
      loadTodos(router.query.cid);
    }
  }, [router.query.cid]);

  if (!data) return "Loading...";
  return (
    <div className={styles.container}>
      <Head>
        <title>DeTodos - Decentralized Todo App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.grid}>
          {cid ? (
            <h1 className={styles.title}>{title}</h1>
          ) : (
            <div className={styles.cardForm}>
              <input
                className={styles.cardInput}
                type="text"
                name="title"
                placeholder="Enter a Vault Title"
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
          )}
          <br />
          <br />

          {loading ? (
            <a href="#" className={styles.card}>
              <img src="/loader.gif" />
            </a>
          ) : (
            title && (
              <form className={styles.cardForm} onSubmit={addTodo}>
                <input
                  className={styles.cardInput}
                  type="text"
                  name="todo"
                  onChange={(event) => setTodo(event.target.value)}
                  placeholder="Enter a todo item"
                />
              </form>
            )
          )}

          {data &&
            data.items &&
            data.items.map((item) =>
              !item.completed ? (
                <a
                  href="#"
                  onClick={() => removeTodo(item)}
                  className={styles.card}
                >
                  <p>{item.text}</p>
                </a>
              ) : (
                <div className={styles.cardCompleted}>
                  <p>{item.text}</p>
                </div>
              )
            )}
        </div>
        {cidurl && (
          <>
            <div>
              <a href={cidurl} target="_blank" rel="noopener noreferrer">
                DeTodo IPFS CID
              </a>
            </div>
            <div>
              <Link
                href={{
                  pathname: "/",
                  query: { cid: cid },
                }}
              >
                <a target="_blank" rel="noopener noreferrer">
                  {" "}
                  Share your DeTodo list
                </a>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
