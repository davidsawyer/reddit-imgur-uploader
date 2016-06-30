$('#siteTable form[action="#"] div.bottom-area a.reddiquette, ' +         // comments page's post text section
    '.commentarea form[action="#"] div.bottom-area a.reddiquette').after( // comments page's comments section
        '<label class="image-uploader-button" tabindex="0">upload image' +
            '<input type="file" class="image-uploader">' +
            '<span class="error-tooltip"></span>' +
        '</label>'
    );

// submit page's text section
$('form.submit div.bottom-area a.reddiquette').after(
    '<label class="image-uploader-button for-submit-text-page" tabindex="0">upload image' +
        '<input type="file" class="image-uploader">' +
        '<span class="error-tooltip"></span>' +
    '</label>'
);

// use an iife here so that the scope of these vars doesn't get too crazy
;(function() {
    var $suggestTitleDiv = $('#new-link-image-input');
    $suggestTitleDiv.append(
        '<label class="image-uploader-button for-submit-link-page" tabindex="0">upload image' +
            '<input type="file" class="image-uploader">' +
            '<span class="error-tooltip"></span>' +
        '</label>'
    );

    $suggestTitleDiv
        .find('.image-uploader-button')
        .css({
            "float": "none",
            "margin-left": 0,
            "margin-top": "20px"
        })
})();

$('body').click(function(event) {
    var $target = $(event.target)
    if ($target.is('label.image-uploader-button')) {
        // reddit is sometimes slapping `for="<random numbers>"` on our label/button
        // when a new comment textarea is opened. we want that attribute to go away
        // when the user clicks the button so that it opens up our file chooser
        $target.removeAttr('for');

        removeButtonError($target);
        setUpFileHandler($target);
    } else if ($target.is('a.access-required[data-event-action="reply"]')) {
        var $reddiquetteLink = $target.closest('.thing[data-type="comment"]').find('.child form[action="#"] div.bottom-area a.reddiquette')

        if ($reddiquetteLink.siblings('label.image-uploader-button').length == 0) {
            $reddiquetteLink.after(
                '<label class="image-uploader-button" tabindex="0">upload image' +
                    '<input type="file" class="image-uploader">' +
                    '<span class="error-tooltip"></span>' +
                '</label>'
            );
        }
    }
});


$('#siteTable form[action="#"] .md textarea, ' + // comments page's OP textarea
    '.commentarea form[action="#"] .md textarea, ' + // comments page's comment textarea
    'form.submit .md textarea') // submit page's textarea
        .blur(function preserveHighlightIfNecessary() {

    var textarea = this,
        $textarea = $(textarea);

    if (textarea.selectionStart != textarea.selectionEnd) {
        setTimeout(function() {
            var $activeElement = $(document.activeElement),
                $correspondingTextarea;

            if ($activeElement.hasClass('image-uploader-button')) {
                if ($activeElement.hasClass('for-submit-text-page')) {
                    $correspondingTextarea = $activeElement.closest('.usertext-edit').find('.md textarea');
                } else {
                    $correspondingTextarea = $activeElement.closest('form').find('textarea');
                }

                if ($correspondingTextarea[0] === textarea) {
                    $textarea.addClass('reddit-imgur-uploader-just-active-and-highlighted');

                    var $fileInput = $activeElement.find('.image-uploader');

                    $fileInput.one('click', function() {
                        preserveSelection(textarea);
                    });
                }
            }
        });
    }
});

function preserveSelection(element) {
    var selectionStart = element.selectionStart,
        selectionEnd = element.selectionEnd;

    element.selectionStart = selectionStart
    element.selectionEnd = selectionEnd
}

function injectLink($textNode, url) {
    var textNode = $textNode[0],
        justActiveAndHighlightedClass = 'reddit-imgur-uploader-just-active-and-highlighted',
        currentText = $textNode.val();

    if ($textNode.hasClass(justActiveAndHighlightedClass)) {
        $textNode.removeClass(justActiveAndHighlightedClass);

        var highlightedText = currentText.substring(textNode.selectionStart, textNode.selectionEnd),
            textBeforeHighlightedText = currentText.substring(0, textNode.selectionStart),
            textAfterHighlightedText = currentText.substring(textNode.selectionEnd),
            markdownLink = '[' + highlightedText + '](' + url + ')',
            newText = textBeforeHighlightedText + markdownLink + textAfterHighlightedText;

        $textNode.val(newText);

        var indexOfMarkdownLink = newText.indexOf(markdownLink);

        textNode.selectionStart = indexOfMarkdownLink;
        textNode.selectionEnd = indexOfMarkdownLink + markdownLink.length;
    } else {
        $textNode
            .focus()
            .val(currentText + (currentText.trim().length > 0 ? " " : "") + url);

        // highlight our newly inserted URL
        var textNode = $textNode[0];
        if (textNode) {
            currentText = $textNode.val();
            textNode.selectionStart = currentText.indexOf(url);
            textNode.selectionEnd = currentText.length;
        }
    }

    // dispatch event so that RES's Live Preview updates
    textNode.dispatchEvent(new Event('input'));
}


function setUpFileHandler($button) {
    var $fileInput = $button.find('.image-uploader');

    $fileInput
        .off('change')
        .on('change', function(event) {
            var image = event.target.files[0];

            // if we don't reset the element and the user chooses the same file
            // back to back, it won't trigger a change event the second time
            resetFileInputElement($fileInput, event);

            if (image) {
                if (! hasAcceptableMimeType(image)) {
                    showButtonError($button, "Sorry, it's gotta be some sort of image file!");
                    return
                }

                 // if over 10MB
                if (image.size > 10000000) {
                    showButtonError($button, "Sorry, the file can only be a maximum of 10MB");
                    return
                }

                uploadImageFromFileInput(image, $fileInput);
            }
        });
}

function resetFileInputElement($fileInput, event) {
    $fileInput.wrap('<form>').closest('form').get(0).reset();
    $fileInput.unwrap();

    event.stopPropagation();
    event.preventDefault();
}

function uploadImageFromFileInput(image, $fileInput) {
    var $button = $fileInput.closest('label.image-uploader-button'),
        $input = $button.find('input'),
        data = new FormData(),
        $targetTextElement;

        if ($button.hasClass('for-submit-link-page')) {
            $targetTextElement = $button.closest('#new-link-image-input').siblings('#new-link-url-input').find('input[type="url"]');
        } else if ($button.hasClass('for-submit-text-page')) {
            $targetTextElement = $button.closest('.usertext-edit').find('.md textarea');
        } else {
            $targetTextElement = $fileInput.closest('form').find('textarea');
        }

    data.append("image", image);

    $input.attr('disabled', 'true');

    showLoading($targetTextElement);

    $.ajax(
        "https://api.imgur.com/3/upload",
        {
            data: data,
            method: "POST",
            headers: {
                "Authorization": "Client-ID 68238063ee04a62" // Reddit Imgur Uploader's unique app id
            },
            processData: false,
            contentType: false
        }
    )
    .done(function(data, textStatus, jqXHR) {
        if (data && data.data && data.data.link && data.data.link.length > 0) {
            var currentText = $targetTextElement.val(),
                imgurUrl = data.data.link.replace('http://', 'https://'); // imgur often passes back non-SSL URLs

            injectLink($targetTextElement, imgurUrl);
        } else {
            showButtonError($button, "Uh oh, something went wrong" +
                (data && data.data && data.data.error ? " " + data.data.error : ""));
        }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        showButtonError($button, "Uh oh, something went wrong" +
            (jqXHR && jqXHR.responseJSON && jqXHR.responseJSON.data && jqXHR.responseJSON.data.error ?
                " " + jqXHR.responseJSON.data.error :
                ""));
    })
    .always(function(data) {
        $input.removeAttr('disabled');

        hideLoading($targetTextElement);
    });
}

function hasAcceptableMimeType(image) {
    var acceptableMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/tiff',
            'image/x-tiff',
            'image/bmp',
            'image/x-bmp',
            'image/x-bitmap',
            'image/x-xbitmap',
            'image/x-win-bitmap',
            'image/x-windows-bmp',
            'image/ms-bmp',
            'image/x-ms-bmp',
            'application/bmp',
            'application/x-bmp',
            'application/x-win-bitmap',
            'application/pdf',
            'application/x-pdf',
            'image/x-xcf',
            'image/xcf'
        ],
        isAcceptable = false;

    acceptableMimeTypes.forEach(function(type) {
        if (image.type == type) {
            isAcceptable = true;
        }
    });

    return isAcceptable
}

function showLoading($targetTextElement) {
    var $containerDiv,
        height,
        width,
        marginTop = 0,
        marginLeft = 0,
        loadingGifUrl = chrome.extension.getURL('dist/images/loading.gif');

    if ($targetTextElement.is('#url')) {
        $containerDiv = $targetTextElement.closest('#url-field')
        height = $containerDiv.outerHeight()
        width = $containerDiv.outerWidth()

    } else {
        $containerDiv = $targetTextElement.closest('.md')
        height = $targetTextElement.outerHeight()
        width = $targetTextElement.outerWidth()
        marginTop = $containerDiv.css("padding-top")   // give our loading div some margin to offset any
        marginLeft = $containerDiv.css("padding-left") // padding that the container div may have
    }

    $containerDiv
        .css('position', 'relative')
        .append($('<div/>').addClass('reddit-imgur-uploader-loading-pane').text('Uploading...'));

    $containerDiv.find('.reddit-imgur-uploader-loading-pane').css({
        'background-image': 'url(' + loadingGifUrl + ')',
        'height': height,
        'width': width,
        'margin-top': marginTop,
        'margin-left': marginLeft
    });
}

function hideLoading($targetTextElement) {
    var $containerDiv = $targetTextElement.is('#url') ?
        $targetTextElement.closest('#url-field') :
        $targetTextElement.closest('.md');

    var $loadingPane = $containerDiv.find('.reddit-imgur-uploader-loading-pane');

    $loadingPane.css('opacity', 0);

    setTimeout(function() {
        $loadingPane.remove();
        $targetTextElement.css('transition', '');
        $containerDiv.closest('.md').css('position', 'static');
    }, 210);
}

function showButtonError($button, errorMsg) {
    var $tooltip = $button.find('.error-tooltip')

    $tooltip.text(errorMsg);

    // pretty much some magic numbers :)
    var topOffset = - ($tooltip.height() + 17)
        leftOffset = 40 - $tooltip.width() / 2;

    $button
        .find('.error-tooltip')
        .css({
            "top": topOffset,
            "left": leftOffset
        });

    $button
        .addClass('reddit-imgur-uploader-error');

    setTimeout(removeButtonError.bind(null, $button), 6000);
}

function removeButtonError($button) {
    $button.removeClass('reddit-imgur-uploader-error');
};
