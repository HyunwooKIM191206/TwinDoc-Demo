//전역데이터 저장
let jsnData = {};
let reviews = {};
let allReviewArray = []; //모든 리뷰에 보여줄 배열
let keyPhraseArray = []; //키프레이즈에 해당하는 리뷰 배열

// 화면 구성
function setData() {
    $.when(
        // 데이터 불러오기
        $.getJSON('../json/predict_all_rev75prod85_with_demo.json', function (data) {
            jsnData = data;
        })
    ).then(function (data) {
        //제품번호 가져오기
        let prodNum = JSON.parse(localStorage.getItem('prodNum'));
        console.log(prodNum);

        //이미지, 제품명 가져오기
        let prodImg = data[prodNum].prodImg;
        let prodName = data[prodNum].prodName;
        let $img = "<img src = '" + prodImg + "'>" + prodName + "</button>"
        $("#prod").append($img);

        //keyphrase를 추출
        let content = data[prodNum].content;
        console.log(content, "content");

        //detail.html 시작에 보여줄 allReview
        $.each(content, function (keyPhrase, review) {
            $.each(review[1].sort(date_descending), function (i, prod) {
                let $rv = $(`<div class = '${keyPhrase}'><div id='date'>${prod.rev_date}</div>${prod.comment}</div>'`);
                allReviewArray.push($rv);
            });
        });
        let total = allReviewArray.length;
        $('#pagination-demo').twbsPagination({
            totalPages: total / 10,
            visiblePages: 10,
            next: 'Next',
            prev: 'Prev',
            onPageClick: function (event, page) {
                //fetch content and render here                
                console.log(allReviewArray.slice(page * 10 - 10, page * 10));
                $('#allReview').html(allReviewArray.slice(page * 10 - 10, page * 10));
            }
        });

        //각각의 KeyPhrase에 해당하는 리뷰 추출
        $.each(content, function (keyPhrase, review) {
            //리뷰추출
            reviews[keyPhrase] = review[1];
            console.log(review[1]);

            //버튼 all, keyPhrase해당하는 만큼 버튼만들기
            let $button = "<button id = '" + keyPhrase + "'>" + review[0] + "</button>";
            $("#reviewAll").append($button);
        });

        //keyPhrase 클릭시 해당 리뷰 & 유사상품 출력
        $(document).on('click', 'button', function () {
            //review & allReview div 내용 삭제
            keyPhraseArray = [];
            $('#review *').remove();
            $('#allReview *').remove();
            $('#pagination-demo *').remove();
            let btnID = $(this).attr('id');
            if (btnID != 'btnReviewAll') {
                //KeyPhrase에 해당하는 리뷰
                $.each(content, function (keyPhrase, review) {
                    $.each(review[1].sort(date_descending), function (i, prod) {
                        if (btnID == keyPhrase) {
                            //highlighting을 위한 index값
                            let idx = prod.idx[0];
                            //review(comment)
                            let comment = prod.comment;
                            //review date
                            let rvDate = prod.rev_date;
                            //review highlighting
                            let highlight = comment.substring(0, idx[0]) + '<font color="red">' + comment.substring(idx[0], idx[1]) + '</font>' + comment.substring(idx[1]);
                            let $rv = $(`<div class = '${btnID}'><div id='date'>${rvDate.substring(0, 10).replace(/-/g, '')}</div>${highlight}</div>'`);
                            keyPhraseArray.push($rv);
                            //$('#review').append($rv);
                        }
                    });
                    //유사상품 이미지 & 명
                    let similarProdName = [];
                    let similarProdImg = [];
                    $.each(review[2], function (i, prod) {
                        similarProdName.push(prod.similarProdName);
                        similarProdImg.push(prod.similarProdImg);
                    });
                    //모달 form에 전달할 유사상품 정보
                    // if (btnID == keyPhrase) {
                    //     for (let i = 0; i < similarProdImg.length; i++) {
                    //         let $btnId = $(`<div class = '${btnID}'></div>`);
                    //         $btnId.append($(`<img src = '${similarProdImg[i]}'>`));
                    //         $btnId.append($(`<div id = '${btnID}'>${similarProdName[i]}</div>`));
                    //         $('#simProd').append($btnId)
                    //     }
                    // }
                });
                //모달 form
                let total = keyPhraseArray.length;
                console.log(total);
                $('#pagination-demo2').twbsPagination({
                    totalPages: total / 10,
                    visiblePages: 10,
                    next: 'Next',
                    prev: 'Prev',
                    onPageClick: function (event, page) {
                        //fetch content and render here                
                        console.log(keyPhraseArray.slice(page * 10 - 10, page * 10));
                        $('#review').html(keyPhraseArray.slice(page * 10 - 10, page * 10));
                    }
                });
            } else {
                let total = allReviewArray.length;
                $('#pagination-demo2').twbsPagination({
                    totalPages: total / 10,
                    visiblePages: 10,
                    next: 'Next',
                    prev: 'Prev',
                    onPageClick: function (event, page) {
                        //fetch content and render here                
                        console.log(allReviewArray.slice(page * 10 - 10, page * 10));
                        $('#allReview').html(allReviewArray.slice(page * 10 - 10, page * 10));
                    }
                });
                // let total = keyPhraseArray.length;
                // $('#pagination-demo').twbsPagination({
                //     totalPages: total / 10,
                //     visiblePages: 10,
                //     next: 'Next',
                //     prev: 'Prev',
                //     onPageClick: function (event, page) {
                //         //fetch content and render here                
                //         console.log(keyPhraseArray.slice(page * 10 - 10, page * 10));
                //         $('#review').html(keyPhraseArray.slice(page * 10 - 10, page * 10));
                //     }
                // });
                //모든 리뷰
                // $.each(content, function (keyPhrase, review) {
                //     $.each(review[1].sort(date_descending), function (i, prod) {
                //         let $rv = $(`<div class = '${btnID}'><div id='date'>${prod.rev_date}</div>${prod.comment}</div>'`);
                //         $('#allReview').append($rv);
                //     })

                // });
            }
        });
    });
};

//시간 순 정렬
function date_descending(a, b) {
    var dateA = new Date(a['rev_date']).getTime();
    var dateB = new Date(b['rev_date']).getTime();
    return dateA < dateB ? 1 : -1;
};

$(function () {
    setData();
});