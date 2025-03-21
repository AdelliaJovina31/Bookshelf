const books = [];

const RENDER_EVENT = 'render_book_lists';
const SAVE_EVENT = "saved_book";
const STORAGE_KEY = 'TODO_APPS';

function generateID() {
	return +new Date();
}

function addBook() {
	const title = document.getElementById('input_judul_buku').value;
	const author = document.getElementById('input_penulis_buku').value;
	const year = parseInt(document.getElementById('input_tahun').value);
	const isComplete = document.getElementById('input_isComplete').checked;

	const id = generateID();

	const newList = generateBookObject(id, title, author, year, isComplete);

	books.push(newList);

	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function loadDataFromStorage() {
	const serializedData = localStorage.getItem(STORAGE_KEY);

	let data = JSON.parse(serializedData);

	if(data !== null){
		for(const book of data){
			books.push(book);
		}
	}

	document.dispatchEvent(new Event(RENDER_EVENT));
}

function updateBook(bookId) {
	const target = findBook(bookId);
	if (!target) {
		console.log("Buku tidak ditemukan");
		return;
	}
	target.title = document.getElementById('edit_judul_buku').value;
	target.author = document.getElementById('edit_penulis_buku').value;
	target.year = document.getElementById('edit_tahun').value;

	console.log("Buku berhasil di-update:", target);
	saveData();
	document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener('DOMContentLoaded', function() {
	const navLinks = document.querySelectorAll('header nav ul li a');
	const sections = document.querySelectorAll('main section')

	window.onscroll = () => {
	    sections.forEach(section => {
	        let top = window.scrollY;
	        let offset = section.offsetTop - 150;
	        let height = section.offsetHeight;
	        let id = section.getAttribute('id');

	        if (top >= offset && top < offset + height) {
	            navLinks.forEach(link => {
	                link.classList.remove('active');
	            });
	            document.querySelector(`header nav ul li a[href='#${id}']`).classList.add('active');
	        }
	    });
	};

	document.getElementById('input_judul_buku').value = '';
	document.getElementById('input_penulis_buku').value = '';
	document.getElementById('input_tahun').value = '';
	document.getElementById('input_isComplete').checked = false;

	const submitForm = document.getElementById('input_buku');
	submitForm.addEventListener('submit', function(ev){
		ev.preventDefault();
		addBook();

		document.getElementById('input_judul_buku').value = '';
		document.getElementById('input_penulis_buku').value = '';
		document.getElementById('input_tahun').value = '';
		document.getElementById('input_isComplete').checked = false;
	});

	if(isStorageExist()) {
		loadDataFromStorage();
	}

	const editModal = document.getElementById('edit_modal');
	const closeModal = document.getElementById('close_modal');
	const editForm = document.getElementById('edit_buku');

	closeModal.addEventListener('click', function() {
		editModal.classList.remove('active');
	});

	editForm.addEventListener('submit', function(ev) {
		ev.preventDefault();
		console.log("Edit form berhasil di-submit");

		const id = editForm.dataset.bookId;
		updateBook(id);

		const editModal = document.getElementById('edit_modal');
		editModal.classList.remove('active');
	});

	const search = document.getElementById('searchBook');
	
	search.addEventListener('submit', function(ev) {
		ev.preventDefault();
		const searchInput = document.getElementById('searchBookTitle').value;
		console.log('Submit search form');
		searchBook(searchInput);
		console.log("Mencari buku dengan judul:", searchInput);
		console.log('Pencarian selesai');
	});

	const searchInput = document.getElementById('searchBookTitle');

	searchInput.addEventListener('input', function() {
 		const searchText = searchInput.value.trim();

	    if (searchText === '') {
			document.dispatchEvent(new Event(RENDER_EVENT));
	    } else {
			searchBook(searchText);
		}
	});
});

function generateBookObject(id, title, author, year, isComplete) {
	return {
		id, title, author, year, isComplete
	}
}

function findBook(bookId) {
	const book = books.find(book => book.id == bookId);
    return book;
}

function undoFromCompleted(bookId) {
	const target = findBook(bookId);

	if(target == null) return;

	target.isComplete = false;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function addToCompleted(bookId) {
	const target = findBook(bookId);

	if(target == null) return;

	target.isComplete = true;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function findBookIndex(bookId) {
	for(const index in books) {
		if(books[index].id === bookId) {
			return index;
		}
	}

	return -1;
}

function deleteBookList(bookId) {
	const target = findBookIndex(bookId);

	if(target === -1) return;

	books.splice(target, 1);
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function editBook(bookId) {
	const target = findBook(bookId);
	
	if(!target) return;

	document.getElementById('edit_judul_buku').value = target.title;
    document.getElementById('edit_penulis_buku').value = target.author;
    document.getElementById('edit_tahun').value = target.year;

	const editForm = document.getElementById('edit_buku');
  	editForm.dataset.bookId = bookId;

  	const editModal = document.getElementById('edit_modal');
  	editModal.classList.add('active');
}

function makeBookList(bookObject) {
	const {id, title, author, year, isComplete} = bookObject;

	const textTitle = document.createElement('h2');
	textTitle.innerText = title;

	const textAuthor = document.createElement('p');
	textAuthor.innerText = author;

	const textYear = document.createElement('p');
	textYear.innerText = year;

	const textContainer = document.createElement('div');
	textContainer.classList.add('inner');
	textContainer.append(textTitle, textAuthor, textYear);

	const container = document.createElement('div');
	container.classList.add('item', 'shadow');
	container.append(textContainer);
	container.setAttribute('id', `book-${id}`);

	const buttonContainer = document.createElement('div');
	buttonContainer.classList.add('actionButton');

	if(bookObject.isComplete) {
		const undoButton = document.createElement('button');
		undoButton.classList.add('undo-button');
		undoButton.addEventListener('click', function() {
			undoFromCompleted(id);
		});

		const editButton = document.createElement('button');
		editButton.classList.add('edit-button');
		editButton.addEventListener('click', function() {
			editBook(id);
		});

		const deleteButton = document.createElement('button');
		deleteButton.classList.add('delete-button');
		deleteButton.addEventListener('click', function() {
			deleteBookList(id);
		});

		buttonContainer.append(undoButton, editButton, deleteButton);
	} else {
		const checkButton = document.createElement('button');
		checkButton.classList.add('check-button');
		checkButton.addEventListener('click', function() {
			addToCompleted(id);
		});

		const editButton = document.createElement('button');
		editButton.classList.add('edit-button');
		editButton.addEventListener('click', function() {
			editBook(id);
		});

		const deleteButton = document.createElement('button');
		deleteButton.classList.add('delete-button');
		deleteButton.addEventListener('click', function() {
			deleteBookList(id);
		});

		buttonContainer.append(checkButton, editButton, deleteButton);
	}
	container.append(buttonContainer);

	return container;
}

document.addEventListener(RENDER_EVENT, function() {
	const uncompleted = document.getElementById('list_buku_uncompleted');
	uncompleted.innerHTML = '';

	const completed = document.getElementById('list_buku_completed');
	completed.innerHTML = '';

	for(const book of books) {
		const bookElement = makeBookList(book);

		if(!book.isComplete)
			uncompleted.append(bookElement);
		else
			completed.append(bookElement);
	}

	const belumSelesaiSection = document.getElementById('belum_selesai');
    const selesaiSection = document.getElementById('selesai');

    if (uncompleted.innerHTML === '') {
        belumSelesaiSection.classList.add('hidden');
    } else {
        belumSelesaiSection.classList.remove('hidden');
        belumSelesaiSection.style.visibility = 'visible';
    }

    if (completed.innerHTML === '') {
        selesaiSection.classList.add('hidden');
    } else {
        selesaiSection.classList.remove('hidden');
        selesaiSection.style.visibility = 'visible';
    }

    if(uncompleted.innerHTML === '' && completed.innerHTML === '') {
        belumSelesaiSection.style.visibility = 'hidden';
        selesaiSection.style.visibility = 'hidden';
    }
});

function isStorageExist() {
	if(typeof(Storage) === undefined) {
		alert('Browser tidak mendukung web storage');
		return false;
	}

	return true;
}

function saveData() {
	if(isStorageExist()) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
		document.dispatchEvent(new Event(SAVE_EVENT));
		console.log("Data sukses tersimpan:", books);
	} else {
		console.log("Storage tidak tersedia");
	}
}

document.addEventListener('change', function() {
	const isChecked = document.getElementById('input_isComplete').checked;
	const buttonText = document.getElementById('boldText');

	if(isChecked) {
		buttonText.innerText = 'Selesai Dibaca';
	} else {
		buttonText.innerText = 'Belum Selesai Dibaca';
	}
});

document.addEventListener(SAVE_EVENT, function () {
	console.log('Data tersimpan:', localStorage.getItem(STORAGE_KEY));
});

function searchBook(title) {
	const uncompleted = document.getElementById('list_buku_uncompleted');
	const completed = document.getElementById('list_buku_completed');
	const belumSelesaiSection = document.getElementById('belum_selesai');
    const selesaiSection = document.getElementById('selesai');
	
	uncompleted.innerHTML = '';
	completed.innerHTML = '';

	belumSelesaiSection.style.visibility = 'visible';
	selesaiSection.style.visibility = 'visible';

	const filteredBooks = books.filter(book => book.title.toLowerCase().includes(title.toLowerCase()));

	for(const book of filteredBooks) {
		const bookElement = makeBookList(book);
		if(!book.isComplete) {
			uncompleted.append(bookElement);
		} else {
			completed.append(bookElement);
		}
	}

	if(uncompleted.innerHTML === '' && completed.innerHTML === '') {
		belumSelesaiSection.style.visibility = 'hidden';
		selesaiSection.style.visibility = 'hidden';
    } else {
		if (uncompleted.innerHTML === '') {
			belumSelesaiSection.classList.add('hidden');
		} else {
			belumSelesaiSection.classList.remove('hidden');
			belumSelesaiSection.style.visibility = 'visible';
		}

		if (completed.innerHTML === '') {
			selesaiSection.classList.add('hidden');
		} else {
			selesaiSection.classList.remove('hidden');
			selesaiSection.style.visibility = 'visible';
		}
	}
}