var https = require('https');

var Basecamp = function (url, key, oauth) {
  var self = this;
  this.host = url;
  this.oauth = oauth === undefined ? false : oauth;

  if (this.oauth) {
      this.key = key;
  } else {
      this.key = new Buffer(key + ':X', 'utf8').toString('base64');
  }

  this.api = {
    projects: {
      all: function (callback) {
        return self.request('/projects.json', function (err, projects) {
          if (!err) {
            projects = projects.projects ? projects.projects.project : projects.records;
          }

          callback(err, projects);
        });
      },
      count: function (callback) {
        return self.request('/projects/count.json', callback);
      },
      load: function (id, callback) {
        return self.request('/projects/' + id + '.json', callback);
      },
      create: function (callback) {
        callback();
      }
    },
    people: {
      me: function (callback) {
        return self.request('/me.json', callback);
      },
      all: function (callback) {
        return self.request('/people.json', function (err, people) {
          if (!err)
            people = people.people.person;

          callback(err, people);
        });
      },
      fromProject: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/people.json', function (err, people) {
          if (!err)
            people = people.people.person;

          callback(err, people);
        });
      },
      fromCompany: function (companyId, callback) {
        return self.request('/companies/' + companyId + '/people.json', function (err, people) {
          if (!err)
            people = people.people.person;

          callback(err, people);
        });
      },
      load: function (id, callback) {
        return self.request('/people/' + id + '.json', callback);
      },
      create: function(callback) {
        callback();
      }
    },
    companies: {
      all: function (callback) {
        return self.request('/companies.json', function (err, companies) {
          if (!err)
            companies = companies.companies.company;

          callback(err, companies);
        });
      },
      fromProject: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/companies.json', function (err, companies) {
          if (!err)
            companies = companies.companies.company;

          callback(err, companies);
        });
      },
      load: function (id, callback) {
        return self.request('/companies/' + id + '.json', callback);
      }
    },
    categories: {
      fromProject: function (projectId, type, callback) {
        return self.request('/projects/' + projectId + '/categories.json?type=' + type, function (err, categories) {
          if (!err)
            categories = categories.categories.category;

          callback(err, categories);
        });
      },
      load: function (id, callback) {
        return self.request('/categories/' + id + '.json', callback);
      }
    },
    messages: {
      "fromProject": function (projectId, callback) {
        return self.request('/projects/' + projectId + '/posts.json', function (err, messages) {
          if (!err)
            messages = messages.posts.post;

          callback(err, messages)
        });
      },
      fromProjectArchive: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/posts/archive.json', function (err, messages) {
          if (!err)
            messages = messages.posts.post;

          callback(err, messages);
        });
      },
      load: function (id, callback) {
        return self.request('/posts/' + id + '.json', callback);
      },
      fromCategory: function (projectId, categoryId, callback) {
        return self.request('/projects/' + projectId + '/cat/' + categoryId + '/posts.json', function (err, messages) {
          if (!err)
            messages = messages.posts.post;

          callback(err, messages);
        });
      },
      fromCategoryArchive: function (projectId, categoryId, callback) {
        return self.request('/projects/' + projectId + '/cat/' + categoryId + '/posts/archive.json', function (err, messages) {
          if (!err)
            messages = messages.posts.message;

          callback(err, messages);
        });
      }
    },
    comments: {
      fromResource: function (resourceType, resourceId, callback) {
        return self.request('/' + resourceType + '/' + resourceId + '/comments.json', function (err, comments) {
          if (!err)
            comments = comments.comments.comment;

          callback(err, comments);
        });
      },
      load: function (id, callback) {
        return self.request('/comments/' + id + '.json', callback);
      }
    },
    todoLists: {
      all: function (callback) {
        return self.request('/todo_lists.json', function (err, todoLists) {
          if (!err)
            todoLists = todoLists.todoLists.todoList;

          callback(err, todoLists);
        });
      },
      fromResponsible: function (responsibleId, callback) {
        return self.request('/todo_lists.json?responsible_party=' + responsibleId, function (err, todoLists) {
          if (!err)
            todoLists = todoLists.todoLists.todoList;

          callback(err, todoLists);
        });
      },
      fromProject: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/todo_lists.json', function (err, todoLists) {
          if (!err)
            todoLists = todoLists.todoLists.todoList;

          callback(err, todoLists);
        });
      },
      fromProjectPending: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/todo_lists.json?filter=pending', function (err, todoLists) {
          if (!err)
            todoLists = todoLists.todoLists.todoList;

          callback(err, todoLists);
        });
      },
      fromProjectFinished: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/todo_lists.json?filter=finished', function (err, todoLists) {
          if (!err)
            todoLists = todoLists.todoLists.todoList;

          callback(err, todoLists);
        });
      },
      load: function (id, callback) {
        return self.request('/todo_lists/' + id + '.json', callback);
      }
    },
    todoItems: {
      "fromList": function (listId, callback) {
        return self.request('/todo_lists/' + listId + '/todo_items.json', function (err, todoItems) {
          callback(err, todoItems);
        });
      },
      load: function (id, callback) {
        return self.request('/todo_items/' + id + '.json', callback);
      }
    },
    milestones: {
      fromProject: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/milestones/list.json', function (err, milestones) {
          if (!err)
            milestones = milestones.milestones.milestone;

          callback(err, milestones);
        });
      }
    },
    time: {
      fromProject: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/time_entries.json', function (err, time) {
          if (!err)
            time = time.timeEntries;

          callback(err, time);
        });
      },
      fromTodo: function (todoId, callback) {
        return self.request('/todo_items/' + todoId + '/time_entries.json', function (err, time) {
          if (!err)
            time = time.timeEntries;

          callback(err, time);
        });
      },
      report: function (options, callback) {
        var ar = [];
        for (var option in options){
          ar.push(option + '=' + options[option]);
        }
        ar = (ar.length > 0) ? ar.join('&') : '';
        return self.request('/time_entries/report.json?' + ar, function (err, time) {
          if (!err)
            time = time.timeEntries;

          callback(err, time);
        });
      }
    },
    files: {
      fromProject: function (projectId, offset, callback) {
        return self.request('/projects/' + projectId + '/attachments.json?n=' + offset, function (err, files) {
          if (!err)
            files = files.files.attachment;

          callback(err, files);
        });
      }
    }
  };

  return this.api;
};

Basecamp.prototype.request = function (path, callback) {
  function normalise(input, key) {
    var key = key || 'root',
        type = getType(input),
        norm = {};

    if (type != 'Object' && type != 'Array')
      return input;

    if (type == 'Array')
      norm = [];

    for (var sub in input) {
      if (sub == '@') continue;

      if (sub == '#') {
        switch (input[sub]) {
          case 'false':
            norm = false;
            break;
          case 'true':
            norm = true;
            break;
          default:
            norm = input[sub];
            break;
        }
      } else {
        norm[nicerKey(sub)] = normalise(input[sub], sub);
      }
    }

    return norm;
  }

  function getType(obj){
    return Object.prototype.toString.call(obj).match(/^\[object (.*)\]$/)[1]
  }

  function nicerKey(key) {
    return key.replace(/-([a-z])/g, function (g) {
     return g[1].toUpperCase();
    });
  }

  var authRealm = this.oauth ? 'Bearer' : 'Basic';

  var options = {
    "host": this.host,
    "path": path + "?limit=9999", // TODO:  Remove this dirty dirty hack
    "headers": {
      "Authorization": authRealm + ' ' + this.key,
      "Host": this.host.replace('https://', ''),
      "Accept": 'application/json',
      "Content-Type": 'application/json',
      "User-Agent": 'NodeJS'
    }
  };

  var req = https.get(options, function (res) {
    var data = '';
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      data += chunk;
    }).on('end', function () {
      if (res.statusCode != 200) {
        console.error('Basecamp API error: ' + res.statusCode + ' ' + options.path);
        callback(true, {'status': res.statusCode});
        return;
      }

      callback(false, normalise(JSON.parse(data)));
    });
  });
};

module.exports = Basecamp;
