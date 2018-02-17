$(function() {
    var $document, didScroll, offset;
    offset = $('.header').position().top;
    $document = $(document);
    didScroll = false;
    $(window).on('scroll touchmove', function() {
      return didScroll = true;
    });
    return setInterval(function() {
      if (didScroll) {
        $('.header').toggleClass('fixed', $document.scrollTop() > offset);
        return didScroll = false;
      }
    }, 250);
});