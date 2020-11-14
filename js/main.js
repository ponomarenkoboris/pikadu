const firebaseConfig = {
    apiKey: "AIzaSyCFROxyauKMH8HLH2akgGMdFg66-ySteTg",
    authDomain: "pikabu-51b32.firebaseapp.com",
    databaseURL: "https://pikabu-51b32.firebaseio.com",
    projectId: "pikabu-51b32",
    storageBucket: "pikabu-51b32.appspot.com",
    messagingSenderId: "441395202567",
    appId: "1:441395202567:web:b48e59a731b3da1ef5b8a2"
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
console.log('firebase: ', firebase);

let menuToggle = document.querySelector('#menu-toggle');
let menu = document.querySelector('.sidebar');
const regExpValidEmail = /^\w+@\w\.\w{2,}$/;

const loginElem = document.querySelector('.login');
const loginForm = document.querySelector('.login-form');
const emailInput = document.querySelector('.login-email');
const passwordInput = document.querySelector('.login-password');
const loginSignup = document.querySelector('.login-signup');
const loginSignin = document.querySelector('.login-signin');
const userElem = document.querySelector('.user');
const userNameElem = document.querySelector('.user-name');
const exitElem = document.querySelector('.exit');
const editElem = document.querySelector('.edit');
const editContainer = document.querySelector('.edit-container');
const editUsername = document.querySelector('.edit-user-name');
const editPhotoURL = document.querySelector('.edit-user-photo');
const userAvatarElem = document.querySelector('.user-avatar'); 
const postsWrapper = document.querySelector('.posts');
const buttonNewPost = document.querySelector('.button-new-post');
const addPostElem = document.querySelector('.add-post');
const loginForget = document.querySelector('.login-forget');

// Создаём один объект для работы со всеми объектами БД (ООП)
const setUsers = {
  user: null,
  initUser(handler) {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.user = user;
      } else {
        this.user = null;
      }
      if (handler) handler();
    });
  },
  // вход в существующий аккаунт
  logIn(email, password) {
    if (!regExpValidEmail.test(email)) return alert('email не валиден'); 

    firebase.auth().signInWithEmailAndPassword(email, password).catch(err => {
      const errCode = err.code;
      const errMessage = err.message;
      if (errCode === 'auth/worng-password') {
        console.log(errMessage);
        alert('Неверный пароль')
      } else if (errCode === 'auth/user-not-found') {
        console.log(errMessage);
        alert('Пользователь не найден')
      } else {
        alert(errMessge);
      }
      console.log(err);
    });
  },
  // выход из аккаунта 
  logOut() {
    
    firebase.auth().signOut();

  },
  // регистрация 
  signUp(email, password, handler) {
    if (!regExpValidEmail.test(email)) return alert('email не валиден'); 

    if (!email.trim() || !password.trim()) return alert('Введите данные');

    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(() => {
        this.editUser(email.substring(0, email.indexOf('@')), null, handler);
      })
      .catch((err) => {
        const errCode = err.cosde;
        const errMessage = err.message;
        if (errCode === 'auth/weak-password') {
          alert('Слабый пароль');
        } else if (errCode === 'auth/email-already-in-use') {
          alert('Пользователь с таким email уже существует');
        } else {
          alert(errMessage);
        }
        console.log(err);
      });
  },
  // изменение данных user
  editUser(displayName, photoURL = '', handler){

    const user = firebase.auth().currentUser;

    if(displayName) {
      if (photoURL) {
        user.updateProfile({
          displayName,
          photoURL
        }).then(handler)
      } else {
        user.updateProfile({
          displayName
        }).then(handler)
      }
    }
  },
  // если пользователь забыл пароль, то восстановление будет проходить через письмо на почту
  sendForget(email) {
    firebase.auth().sendPasswordResetEmail(email)
      .then(() => {
        alert('Письмо отпрвалено')
      })
      .catch(err => {
        alert(err)
      })
  }
};

const toggleAuthDom = () => {
  const user = setUsers.user;

  if (user) {
    loginElem.style.display = 'none';
    userElem.style.display = '';
    userNameElem.textContent = user.displayName;
    userAvatarElem.src = user.photoURL || userAvatarElem.src;
    buttonNewPost.classList.add('visible');
  } else {
    loginElem.style.display = '';
    userElem.style.display = 'none';
    buttonNewPost.classList.remove('visible');
    addPostElem.classList.remove('visible');
    postsWrapper.classList.add('visible');
  }
  
};

const setPosts = {
  allPosts: [],

  addPost(title, text, tags, handler) {
    
    const user = firebase.auth().currentUser;
    

    this.allPosts.unshift({ 
      id: `postID${(+new Date()).toString(16)}-${user.uid}`,
      title, 
      text, 
      tags: tags.split(',').map(item => item.trim()), 
      author: {
        displayName: setUsers.user.displayName,
        photo: setUsers.user.photoURL,
      }, 
      date: new Date().toLocaleString(), 
      likes: 0, 
      comments: 0,
    })

    firebase.database().ref('post').set(this.allPosts)
      .then(() => this.getPosts(handler))
  },
  getPosts(handler) {
    firebase.database().ref('post').on('value', snapshop => {
      this.allPosts = snapshop.val() || [];
      handler();
    })
  }
};

const showAddPost = () => {
  addPostElem.classList.add('visible');
  postsWrapper.classList.remove('visible');
};

const showAllPosts = () => {

  let postsHTML = '';
  
  setPosts.allPosts.forEach(({ title, text, date, tags, likes, comments, author }) => {

    postsHTML += `
      <section class="post">
        <div class="post-body">
          <h2 class="post-title">${title}</h2>
          <p class="post-text">${text}</p>
          
          <div class="tags">
            ${tags.map(item => `<a href="#" class="tag">#${item}</a>`)}
          </div>
        </div>
        <div class="post-footer">
          <div class="post-buttons">
            <button class="post-button likes">
              <svg width="19" height="20" class="icon icon-like">
                <use xlink:href="img/icons.svg#like"></use>
              </svg>
              <span class="likes-counter">${likes}</span>
            </button>
            <button class="post-button comments">
              <svg width="21" height="21" class="icon icon-comment">
                <use xlink:href="img/icons.svg#comment"></use>
              </svg>
              <span class="comments-counter">${comments}</span>
            </button>
            <button class="post-button save">
              <svg width="19" height="19" class="icon icon-save">
                <use xlink:href="img/icons.svg#save"></use>
              </svg>
            </button>
            <button class="post-button share">
              <svg width="17" height="19" class="icon icon-share">
                <use xlink:href="img/icons.svg#share"></use>
              </svg>
            </button>
          </div>
          <div class="post-author">
            <div class="author-about">
              <a href="#" class="author-username">${author.displayName}</a>
              <span class="post-time">${date}</span>
            </div>
            <a href="#" class="author-link"><img src=${author.photo || "img/avatar.jpeg" } alt="avatar" class="author-avatar"></a>
          </div>
        </div>
      </section>
    `;
  });

  postsWrapper.innerHTML = postsHTML;

  addPostElem.classList.remove('visible');
  postsWrapper.classList.add('visible');
};


const init = () => {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    setUsers.logIn(emailInput.value, passwordInput.value, toggleAuthDom);
    loginForm.reset();
  });

  loginSignup.addEventListener('click', e => {
    e.preventDefault();
    setUsers.signUp(emailInput.value, passwordInput.value, toggleAuthDom);
    loginForm.reset();
  });
  exitElem.addEventListener('click', e => {
    e.preventDefault();
    setUsers.logOut();
  });
  editElem.addEventListener('click', e => {
    e.preventDefault();
    editConteiner.classList.toggle('visible');
    editUsername.value = setUsers.user.displayName;
  });
  editContainer.addEventListener('submit', e => {
    e.preventDefault();
    setUsers.editUser(editUsername.value, editPhotoURL.value, toggleAuthDom);
    editContainer.classList.remove('visible');
  });

  menuToggle.addEventListener('click', function (event) {
    event.preventDefault();
    menu.classList.toggle('visible');
  });
  buttonNewPost.addEventListener('click', e => {
    e.preventDefault();
    showAddPost();
  })

  addPostElem.addEventListener('submit', e => {
    e.preventDefault();
    const { title, text, tags } = addPostElem.elements;
    if (title.value.length < 6) {
      alert('Слишком короткий заголовок');
      return;
    }
    if (text.value.length < 50) {
      alert('Слишком короткий пост');
      return;
    }
    setPosts.addPost(title.value, text.value, tags.value, showAllPosts);
    addPostElem.classList.remove('visible');
    addPostElem.reset();
  });
  loginForget.addEventListener('click', e => {
    e.preventDefault();
    setUsers.sendForget(emailInput.value);
    emailInput.value = ''
  });

  setUsers.initUser(toggleAuthDom);
  setPosts.getPosts(showAllPosts);
};

document.addEventListener('DOMContentLoaded', init);