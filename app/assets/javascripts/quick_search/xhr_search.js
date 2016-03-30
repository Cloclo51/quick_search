function remove_timedout_spinners(){
  $('.fa-refresh').not('.icon-5x').remove();
  $('#no-results-trying-again').remove();
}

function add_found_item_types(endpoint) {
  var dasherized_endpoint = endpoint.replace("_", "-")
  $('.result-types li.' + dasherized_endpoint + " .no-results-label")
    .replaceWith('<a href="#' + dasherized_endpoint + '" data-quicksearch-ga-action="' + 
      dasherized_endpoint + '">' + I18n["en"][endpoint + "_search"]["display_name"]);
}

var xhr_searches = function(){
  // We want to remove the spinners once all of the ajax requests are done. To do this we create an array of all of the ajax
  // requests, which are promises. We can then apply this array so that all the promises are wrapped up together. When
  // they're all done then the 'then' function runs removing the spinners.
  $.when.apply(this,
    $('.search-error').map(function(index){
      var that = $(this);
      var endpoint = that.data('quicksearchSearchEndpoint');
      var params_q = $('#params-q').val();
      var params_page = that.data('quicksearch-page');
      var params_template = that.data('quicksearch-template');
      if (!that.hasClass('silent-search-error')) {
        var parent = that.parent('.module-contents');
        var parent_id = parent[0].id;
      }
      var pathname = window.location.pathname;
      
      var url = pathname;

      if (url.substr(-1) != '/'){
        url += '/';
      }
      url += 'xhr_search.html?q=' + encodeURIComponent(params_q) + '&endpoint=' + endpoint + '&page=' + params_page + '&template=' + params_template;
      
      if (!that.hasClass('silent-search-error')) {
        parent.append('<div class="trying_again"><i class="fa fa-refresh fa-spin"></i> Just a few more seconds </div>');
      }

      return $.ajax({
        url: url,
        timeout: 15000,
        success: function(response){
          var response_object = jQuery.parseJSON(response);

            if (!that.hasClass('silent-search-error')) {
              parent.replaceWith(response_object[endpoint]);
              if (response_object[endpoint].indexOf("search-error-message") <= -1) {
                add_found_item_types(endpoint);
              }
              if (response_object.spelling_suggestion != ' ') {
                  $('#spelling-suggestion').append(response_object.spelling_suggestion).removeClass('hidden');
              }
              if (response_object.related_topics != ' ') {
                  $('#related-topics').append(response_object.related_topics).removeClass('hidden');
              }
            } else {
              that.replaceWith(response_object[endpoint]);
              if ($.trim(response_object[endpoint]) !== '') {
                add_found_item_types(endpoint);
              }
            }
        },
        error: function(){
          if (!that.hasClass('silent-search-error')) {
            parent.find('.trying_again').remove();
            parent.find('.search-error-rescue').show();
          }
        }
      });
    })
  ).then(
    // No matter what the result (success, failure) the spinners ought to be removed.
    remove_timedout_spinners,
    remove_timedout_spinners
    );
}

$(document).ready(function() {
  xhr_searches();
});