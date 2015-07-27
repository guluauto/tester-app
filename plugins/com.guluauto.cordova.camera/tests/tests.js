exports.defineAutoTests = function() {
  describe('Camera source type is album', function() {
    it('should xxxx', function(done) {
      navigator.camera.getPicture(
      function() {
        done();
      },
      function() {
        expect(false).toBe(true);
      },
      {
        quality: 100,
        destinationType: 1,
        sourceType: 0,
        allowEdit: true,
        encodingType: 1,
        saveToPhotoAlbum: false
      });
    });
  });
}