/**
 * @file Declares directives for file upload for which will create array of files with contents  as base64
 * @author Nikhil Sarvaiye
 * @version 0.0.1.0
 */
(function () {
    'use strict';
    /**
     * @ngdoc directive
     * @name file upload
     * @restrict E
     * 
     * @description
     * Creates an array of base 64 content files for server side api's
     * 
     * @requires {css bundle} @System.Web.Optimization.Styles.Render("~/Content/directive/fileUpload")
     * @requires {js bundle} @System.Web.Optimization.Scripts.Render("~/bundles/directive/fileUpload")
     * 
     * @example
        <file-upload metadata='{"type":"test"}' files="Files" readonly></file-upload>
        <file-upload display='grid' files="Files" ></file-upload>
        <file-upload browse-class="file-upload-grid" browse-label="''" browse-icon="<i class="fa fa-paperclip fa-lg "></i>" display='grid' files="Files" show-caption="false" upload="true"></file-upload>
     */
    angular.module("Base").directive('fileUpload', ['DataService', 'ApiRequest', function (DataService, ApiRequest) {
        return {
            scope: {
                Files: '=files', //Two-way data binding
                readonly: '=readonly',
                cssclassforheadings: '@cssclassforheadings'
            },
            restrict: 'E',
            templateUrl: function (el, attrs) {
                var templatePath = '/Areas/AppShared/App/directives/file-upload/',
                    fileUploadTemplate = templatePath + 'file-upload.directive.html',
                    fileUploadGridTemplate = templatePath + 'file-upload-grid.directive.html';
                return attrs.display && attrs.display === 'grid' ? fileUploadGridTemplate : fileUploadTemplate;
            },
            link: function ($scope, el, attrs) {
                var dirEle = el;
                el = $(dirEle).find('input[type=file]');
                //$scope.readonly ? $("#fileControlDiv").hide() : 1;
                // Watch the files variable to calculate the totalActiveFiles count in case of view and edit scenario
                $scope.$watch(function (scope) {
                    return scope.Files;
                }, function () {
                    calcActiveFiles();
                });

                //set title
                if (attrs.title)
                    $scope.title = title;
                else $scope.title = $scope.readonly ? "Supporting Documents" : "Upload Supporting Documents";

                if (attrs.tooltip)
                    $scope.toolTipText = attrs.tooltip;
                else $scope.toolTipText = $scope.title;

                //Method constants for attachments file icons
                var file_icons_images = { excel: 'excel-icon', pdf: 'pdf-icon', ppt: 'ppt-icon', text: 'text-icon', word: 'fa fa-file-word-o fa-lg black', image: 'image-icon' },
                 fileInputOptions = {
                     showCaption: attrs.showCaption ? JSON.parse(attrs.showCaption.toLowerCase()) : true,
                     browseClass: attrs.browseClass || '',
                     browseLabel: attrs.browseLabel ? (attrs.browseLabel === "''" ? '' : attrs.browseLabel) : 'Browse ...',
                     browseIcon: attrs.browseIcon || '<i class="glyphicon glyphicon-folder-open"></i>',
                     showUpload: true,
                     showRemove: false,
                     showClose: true,
                     previewFileType: 'any',
                     allowedFileExtensions: ["jpg", "png", "gif", "pdf", "xls", "xlsx", "doc", "docx", "msg", "txt", "js", "css"],
                     minImageWidth: 290,
                     minImageHeight: 420
                 },
                 metaData = attrs.metadata ? JSON.parse(attrs.metadata) : { EmployeeId: UserIdentity.EmpId, EmployeeName: UserIdentity.FullName },
                 files = [];

                var isValidFile = function (file) {
                    return true;
                }
                , getFileIconByType = function (type) {
                    type = type.toLowerCase();
                    if (type.indexOf('jpeg') > 0 || type.indexOf('png') > 0 || type.indexOf('gif') > 0 || type.indexOf('bitmap') > 0) {
                        return file_icons_images.image;
                    } else if (type.indexOf("ppt") > 0) { return file_icons_images.ppt; }
                    else if (type.indexOf("sheet") > 0) { return file_icons_images.excel; }
                    else if (type.indexOf("pdf") > 0) { return file_icons_images.pdf; }
                    else if (type.indexOf("text") > 0) { return file_icons_images.text; }
                    else if (type.indexOf("word") > 0) { return file_icons_images.word; }
                    else return file_icons_images.text;
                }
                , getFileBuffer = function (file) {
                    var deferred = $.Deferred();
                    var reader = new FileReader();
                    reader.onload = function (e) { deferred.resolve(e.target.result); }
                    reader.onerror = function (e) { deferred.reject(e.target.error); }
                    reader.readAsDataURL(file);
                    return deferred.promise();
                }
                , removeDuplicate = function (contentFile) {
                    var isDuplicateName = false;
                    angular.forEach($scope.Files, function (file) {
                        if (contentFile.name == file.name) {
                            isDuplicateName = true;
                            var index = $scope.Files.indexOf(file)
                            //remove item from array
                            $scope.Files.splice(index, 1);
                            console.log("Same File Found, as thus replaced existing");
                        }
                    });
                }
                , calcActiveFiles = function () {
                    $scope.totalActiveFiles = $scope.Files.filter(function (file, index, array) {
                        return !file.DeleteFile;
                    }).length;
                }
                , applyFileInput = function () {
                    $(el).fileinput(fileInputOptions);
                    //update button type of upload button from submit to button
                    $(dirEle).find(".fileinput-upload-button").attr('type', 'button');
                    $(dirEle).find(".fileinput-upload-button").on('click', function () {
                        $scope.upload();
                        $(dirEle).find('.fileinput-remove').click();
                    });
                    $(dirEle).find(".fileinput-remove").on('click', function () { });
                }
                , clearFileControl = function () {
                    //$(el).on('click', function () { $(el).val(''); });
                    //$(el).val(""); $(el).parent().find('.form-control').val("");
                    //$("input[type=file]").val(""); $("input[type=file]").parent().find('.form-control').val("");
                };
                //declare scopre vars
                $scope.totalActiveFiles = 0;
                $scope.inputSelectedFiles = [];
                $scope.Files = $scope.Files || [];
                //change evnets
                el.bind('change', function (event) {
                    $scope.inputSelectedFiles = [];
                    files = event.target.files;
                    $scope.inputSelectedFiles = event.target.files;
                    $scope.$$phase || $scope.$apply();

                    //change for directly uploading file after selecting by diplaxmi
                    if (attrs.upload == "true") {
                        $scope.upload();
                        $(dirEle).find('.fileinput-remove').click();
                    }
                });
                //upload file
                $scope.upload = function (event) {
                    angular.forEach($scope.inputSelectedFiles, function (file) {
                        if (isValidFile(file)) {
                            getFileBuffer(file).then(function (dataUrl) {
                                var contentFile = new FileAttachment();
                                var datatype = dataUrl.split("base64,")[0];
                                var b64 = dataUrl.split("base64,")[1];
                                contentFile.name = file.name;
                                contentFile.lastModified = file.lastModified;
                                contentFile.size = file.size;
                                contentFile.type = file.type;
                                contentFile.webkitRelativePath = file.webkitRelativePath;
                                contentFile.datatype = datatype;
                                contentFile.datatype = datatype;
                                contentFile.url = dataUrl;
                                contentFile.content = b64;
                                contentFile.AddFile = true;
                                contentFile.NewFile = true;
                                //set metadata
                                contentFile.MetaData = {};
                                for (var key in metaData) { contentFile.MetaData[key] = metaData[key]; }
                                //controller code
                                //check if collection has same name file, if yes then replace earlier one
                                removeDuplicate(contentFile);
                                contentFile.icon = getFileIconByType(contentFile.type);
                                $scope.Files.push(contentFile);
                                $scope.inputSelectedFiles = [];
                                calcActiveFiles();
                                $scope.onUpdateFiles();
                                $scope.$apply();
                            });
                        } else {
                            console.log("Invalid File");
                        }
                    });
                    el.on('click', function () { el.val(''); });
                }
                $scope.onUpdateFiles = function () { }
                $scope.deleteFile = function (file) {
                    //update the item as Marked Deleted
                    if (file.DBFile)
                        file.DeleteFile = true;
                    else $scope.Files.splice($scope.Files.indexOf(file), 1);
                    calcActiveFiles();
                };
                el.bind('contextmenu', function (e) {
                    e.preventDefault();
                });
                applyFileInput();

                //method to download file
                $scope.requestDownloadFile = function (file) {
                    var apiRequest = new ApiRequest();
                    apiRequest.FileAttachments = [];
                    apiRequest.FileAttachments.push(file);
                    DataService.Post("api/Common/Download/FileAttachment", apiRequest).then(function (response) {
                        var files = response;
                        if (files && files.length) {
                            files.forEach(function (file) {
                                downloadFile(file);
                            });
                        }
                    });
                }

                function downloadFile(file) {
                    file.datatype ? file.datatype.indexOf('cbase64,') > -1 ? file.datatype = file.datatype.split(';base64,')[0] : 1 : 1;
                    var blobData = base64ToBlob(file.url, file.datatype);
                    var url = URL.createObjectURL(blobData);
                    //different checks for different browsers
                    navigator.saveBlob = navigator.saveBlob || navigator.msSaveBlob || navigator.mozSaveBlob || navigator.webkitSaveBlob;
                    window.saveAs = window.saveAs || window.webkitSaveAs || window.mozSaveAs || window.msSaveAs;
                    if (navigator.saveBlob) {
                        if (window.saveAs)
                            window.saveAs(blobData, file.name);
                        else
                            navigator.saveBlob(blobData, file.name);
                    } else {
                        //this will work for chrome
                        var hiddenElement = document.createElement('a');
                        hiddenElement.href = url;
                        hiddenElement.target = '_blank';
                        hiddenElement.download = file.name;
                        hiddenElement.click();
                    }
                }
                function base64ToBlob(base64, type) {
                    var binary = atob(base64);
                    var len = binary.length;
                    var buffer = new ArrayBuffer(len);
                    var view = new Uint8Array(buffer);
                    for (var i = 0; i < len; i++) {
                        view[i] = binary.charCodeAt(i);
                    }
                    var blob = new Blob([view], { type: type });
                    return blob;
                }
            }
        };
    }]);
}());