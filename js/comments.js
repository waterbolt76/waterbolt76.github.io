document.addEventListener("DOMContentLoaded", function () {
    var comments = [];
    var commentList = document.getElementById("commentList");

    document.getElementById("addNewComment").addEventListener("click", function (event) {
        event.preventDefault();

        var input = document.getElementById("newComment");
        var inputValue = input.value.trim();

        if (inputValue === "") {
            alert("Write a comment");
            return;
        }

        var itemExists = comments.some(comment => comment.comment.toLowerCase() === inputValue.toLowerCase());
        if (itemExists) {
            alert("This comment already exists!");
            return;
        }

        comments.push({ comment: inputValue });
        input.value = "";
        updateComments();
    });

    function updateComments() {
        commentList.innerHTML = "";

        comments.forEach(function (el) {
            var commentItem = document.createElement("li");
            commentItem.innerText = el.comment;
            commentList.appendChild(commentItem);
        });
    }
});
