/**
 * Created by EIJI on 2014/1/3.
 * https://github.com/apolkingg8/JQueryDatePickerTW
 */

(function(){

    var dateNative = new Date(),
        dateTW = new Date(
            dateNative.getFullYear() - 1911,
            dateNative.getMonth(),
            dateNative.getDate()
        );

    var pad_left = function(str, len){
        str = str.toString();
        if(str.length >= len){
            return str;
        }else{
            return pad_left(("0" + str), len);
        }
    };

    var funcColle = {
        onSelect: {
            basic: function(dateText, inst){
                /*
                 var yearNative = inst.selectedYear < 1911
                 ? inst.selectedYear + 1911 : inst.selectedYear;*/
                dateNative = new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay);

                var yearTW = inst.selectedYear > 1911? pad_left(inst.selectedYear - 1911, 4): inst.selectedYear;
                var monthTW = pad_left(inst.selectedMonth + 1, 2);
                var dayTW = pad_left(inst.selectedDay, 2);
                dateTW = new Date(yearTW + '-' +monthTW + '-' +dayTW + 'T00:00:00.000Z');
                return $.datepicker.formatDate(twSettings.dateFormat, dateTW);
            }
        }
    };

    var twSettings = {
        closeText: '關閉',
        prevText: '上個月',
        nextText: '下個月',
        currentText: '今天',
        monthNames: ['一月','二月','三月','四月','五月','六月',
            '七月','八月','九月','十月','十一月','十二月'],
        monthNamesShort: ['一月','二月','三月','四月','五月','六月',
            '七月','八月','九月','十月','十一月','十二月'],
        dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
        dayNamesShort: ['周日','周一','周二','周三','周四','周五','周六'],
        dayNamesMin: ['日','一','二','三','四','五','六'],
        weekHeader: '周',
        dateFormat: 'yy/mm/dd',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: true,
        yearSuffix: '',

        onSelect: function(dateText, inst){
            $(this).val(funcColle.onSelect.basic(dateText, inst));
            if(typeof funcColle.onSelect.newFunc === 'function'){
                funcColle.onSelect.newFunc(dateText, inst);
            }
        }
    };

    // yearText convert zh-format
    var replaceYearText = function(){
        var $yearText = $('.ui-datepicker-year');

        if(twSettings.changeYear !== true){
            $yearText.text('民國' + dateTW.getFullYear());
        }else{
            // 下拉選單
            if($yearText.prev('span.datepickerTW-yearPrefix').length === 0){
                $yearText.before("<span class='datepickerTW-yearPrefix'>民國</span>");
            }
            $yearText.children().each(function(){
                if(parseInt($(this).text()) > 1911){
                    $(this).text(parseInt($(this).text()) - 1911);
                }
            });
        }
    };

    $.fn.datepickerTW = function(options){

        // setting on init,
        if(typeof options === 'object'){
            //onSelect例外處理, 避免覆蓋
            if(typeof options.onSelect === 'function'){
                funcColle.onSelect.newFunc = options.onSelect;
                options.onSelect = twSettings.onSelect;
            }
            // year range正規化成西元, 小於1911的數字都會被當成民國年
            if(options.yearRange){
                var temp = options.yearRange.split(':');
                for(var i = 0; i < temp.length; i += 1){
                    //民國前處理
                    if(parseInt(temp[i]) < 1 ){
                        temp[i] = parseInt(temp[i]) + 1911;
                    }else{
                        temp[i] = parseInt(temp[i]) < 1911
                            ? parseInt(temp[i]) + 1911
                            : temp[i];
                    }
                }
                options.yearRange = temp[0] + ':' + temp[1];
            }

        }

        // setting after init
        if(arguments.length > 1){
            if(arguments[0] === 'option'){
                options = {};
                options[arguments[1]] = arguments[2];
            }
        }

        // override settings
        $.extend(twSettings, options);

        // init
        $(this).datepicker(twSettings);

        // beforeRender
        $(this).click(function(){
            var isFirstTime = ($(this).val() === '');

            // year range and default date

            if((twSettings.defaultDate || twSettings.yearRange) && isFirstTime){

                if(twSettings.defaultDate){
                    $(this).datepicker('setDate', twSettings.defaultDate);
                }

                // 當有year range時, select初始化設成range的最末年
                if(twSettings.yearRange){
                    var $yearSelect = $('.ui-datepicker-year'),
                        nowYear = twSettings.defaultDate ? $(this).datepicker('getDate').getFullYear() : dateNative.getFullYear();

                    $yearSelect.children(':selected').removeAttr('selected');
                    if($yearSelect.children('[value=' + nowYear + ']').length > 0){
                        $yearSelect.children('[value=' + nowYear + ']').attr('selected', 'selected');
                    }else{
                        $yearSelect.children().last().attr('selected', 'selected');
                    }
                }
            } else {
                var zh_date = $(this).val();
                var zh_data_arr = zh_date.split('-');
                var year = (parseInt(zh_data_arr[0]) + 1911);

                var date_obj = new Date(
                    year+'-'+zh_data_arr[1]+'-'+zh_data_arr[2]
                );
                $(this).datepicker('setDate', date_obj);
                $(this).val(zh_date);
            }

            //$(this).val($.datepicker.formatDate(twSettings.dateFormat, date_obj));

            replaceYearText();

            if(isFirstTime){
                $(this).val('');
            }
        });

        // afterRender
        $(this).focus(function(){
            replaceYearText();
        });

        return this;
    };

})();
